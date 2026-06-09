const express = require('express');
const router = express.Router();
const pool = require('../db');

const weekdays = ['Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek'];

const parseTime = (time) => {
  if (typeof time !== 'string') return null;
  const [hh, mm] = time.split(':').map((part) => parseInt(part, 10));
  if (Number.isNaN(hh) || Number.isNaN(mm)) return null;
  return hh * 60 + mm;
};

const formatTime = (minutes) => {
  const hh = String(Math.floor(minutes / 60)).padStart(2, '0');
  const mm = String(minutes % 60).padStart(2, '0');
  return `${hh}:${mm}`;
};

const buildHourlySlots = (fromMinutes, toMinutes) => {
  const slots = [];
  for (let t = fromMinutes; t + 60 <= toMinutes; t += 60) {
    slots.push(t);
  }
  return slots;
};

const scorePlacement = (assignment, currentPlan, preferences, dayUsage) => {
  let score = 0;
  if (preferences.preferredLecturerDays.includes(assignment.day)) {
    score += 30;
  }
  const hourIndex = assignment.start / 60;
  score += (24 - hourIndex) * (preferences.latePreference / 100);
  score += (5 - dayUsage[assignment.day]) * (preferences.spreadPreference / 100);

  const dayAssignments = currentPlan.filter((item) => item.day === assignment.day);
  if (dayAssignments.length > 0) {
    const gaps = dayAssignments.reduce((sum, item) => {
      if (item.start < assignment.start) return sum + Math.abs(item.start + item.duration * 60 - assignment.start);
      if (item.start > assignment.start) return sum + Math.abs(assignment.start + assignment.duration * 60 - item.start);
      return sum;
    }, 0);
    score -= gaps * (preferences.windowPreference / 500);
  }

  return score;
};

const canPlace = (assignment, currentPlan) => {
  for (const placed of currentPlan) {
    if (placed.day !== assignment.day) continue;
    const overlap = Math.max(placed.start, assignment.start) < Math.min(placed.start + placed.duration * 60, assignment.start + assignment.duration * 60);
    if (overlap && placed.lecturerId === assignment.lecturerId) {
      return false;
    }
  }
  return true;
};

const solveSchedule = (items, allowedDays, allowedSlots, preferences) => {
  const plan = [];
  const dayUsage = Object.fromEntries(weekdays.map((d) => [d, 0]));

  const sortedItems = [...items].sort((a, b) => b.duration - a.duration || b.name.localeCompare(a.name));

  for (const item of sortedItems) {
    let best = null;
    for (const day of allowedDays) {
      for (const start of allowedSlots) {
        const assignment = {
          courseId: item.id,
          name: item.name,
          lecturer: item.lecturer,
          lecturerId: item.lecturerId,
          duration: item.duration,
          type: item.type,
          day,
          start,
          room: `S${(item.id % 10) + 1}`,
        };
        if (!canPlace(assignment, plan)) continue;
        if (start + item.duration * 60 > Math.max(...allowedSlots) + 60) continue;
        const score = scorePlacement(assignment, plan, preferences, dayUsage);
        if (!best || score > best.score) {
          best = { assignment, score };
        }
      }
    }
    if (best) {
      plan.push(best.assignment);
      dayUsage[best.assignment.day] += 1;
    }
  }

  plan.sort((a, b) => weekdays.indexOf(a.day) - weekdays.indexOf(b.day) || a.start - b.start);
  return plan.map((assignment) => ({
    day: assignment.day,
    time: formatTime(assignment.start),
    name: assignment.name,
    lecturer: assignment.lecturer,
    room: assignment.room,
    type: assignment.type,
    duration: `${assignment.duration}h`,
  }));
};

router.post('/planista/generate', async (req, res) => {
  try {
    const {
      selectedDays = weekdays,
      preferredLecturerDays = [],
      selectedSubjectIds = [],
      selectedLecturerIds = [],
      earliestTime = '08:00',
      latestTime = '16:00',
      windowPreference = 50,
      latePreference = 50,
      spreadPreference = 50,
    } = req.body;

    const allowedDays = Array.isArray(selectedDays) && selectedDays.length > 0
      ? selectedDays.filter((d) => weekdays.includes(d))
      : weekdays;

    const subjectIds = Array.isArray(selectedSubjectIds)
      ? selectedSubjectIds.map((id) => Number(id)).filter((id) => !Number.isNaN(id))
      : [];
    const lecturerIds = Array.isArray(selectedLecturerIds)
      ? selectedLecturerIds.map((id) => Number(id)).filter((id) => !Number.isNaN(id))
      : [];

    const startMinutes = parseTime(earliestTime) ?? 8 * 60;
    const endMinutes = parseTime(latestTime) ?? 16 * 60;

    const timesResult = await pool.query('SELECT DISTINCT czas FROM zajecia ORDER BY czas');
    const availableSlots = timesResult.rows
      .map((row) => parseTime(row.czas))
      .filter((value) => value != null);
    const allowedSlots = availableSlots.length > 0
      ? availableSlots
      : buildHourlySlots(startMinutes, endMinutes);

    const result = await pool.query(
      `SELECT p.idprzedmiotu, p.nazwa, p.typ, p.ilosc_godz, p.wykladowca_id,
              COALESCE(w.imie || ' ' || w.nazwisko, 'Brak wykładowcy') AS lecturer
       FROM przedmiot p
       LEFT JOIN wykladowca w ON p.wykladowca_id = w.idwykladowca
       ORDER BY p.idprzedmiotu`
    );

    const filtered = result.rows.filter((row) => (
      (subjectIds.length === 0 || subjectIds.includes(row.idprzedmiotu)) &&
      (lecturerIds.length === 0 || lecturerIds.includes(row.wykladowca_id))
    ));

    const items = filtered.map((row) => ({
      id: row.idprzedmiotu,
      name: row.nazwa || 'Nieznany przedmiot',
      type: row.typ || 'Wykład',
      duration: Number.isInteger(row.ilosc_godz) && row.ilosc_godz > 0 ? row.ilosc_godz : 1,
      lecturer: row.lecturer,
      lecturerId: row.wykladowca_id || row.idprzedmiotu,
    }));

    const plan = solveSchedule(items, allowedDays, allowedSlots, {
      preferredLecturerDays,
      windowPreference: Number(windowPreference) || 50,
      latePreference: Number(latePreference) || 50,
      spreadPreference: Number(spreadPreference) || 50,
    });

    res.json({ plan });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Błąd generowania planu' });
  }
});

module.exports = router;
