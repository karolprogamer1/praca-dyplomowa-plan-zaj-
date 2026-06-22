import { useEffect, useState, useRef, useMemo } from 'react'
import '../App.css'
import StudentList from './view_student'
import AddStudent from './add_student'
import EditStudent from './edit_student'
import LecturerList from './view_lecturer'
import AddLecturer from './add_lecturer'
import EditLecturer from './edit_lecturer'
import SubjectList from './view_subject'
import AddSubject from './add_subject'
import EditSubject from './edit_subject'
import ZajeciaList from './view_zajecia'
import AddZajecia from './add_zajecia'
import EditZajecia from './edit_zajecia'
import ViewGroupList from './view_groups'
import ViewGroupDetails from './view_group_details'
import AssignStudentToGroup from './assign_student_to_group.jsx'
import RoomList from './view_room.jsx'
import AddRoom from './add_room.jsx'
import EditRoom from './edit_room.jsx'

function AdminMenu({ user, onLogout }) {
  console.log("AdminMenu rendering. Current user:", user); // Debugging
  const fileInputRef = useRef(null)
  const [activeView, setActiveView] = useState(null)
  const [fontScale, setFontScale] = useState(100)
  const [contrast, setContrast] = useState(100)
  const [importTarget, setImportTarget] = useState(null) // student, lecturer, subject, class
  const [students, setStudents] = useState([])
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [isBulkDeleteMode, setIsBulkDeleteMode] = useState(false);
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [formData, setFormData] = useState({ indexNumber: '', login: '', password: '' })
  const [lecturers, setLecturers] = useState([])
  const [selectedLecturer, setSelectedLecturer] = useState(null)
  const [lecturerFormData, setLecturerFormData] = useState({ userId: '', firstName: '', lastName: '', title: '', availabilityGrid: {}, login: '', password: '' })
  const [subjects, setSubjects] = useState([])
  const [selectedSubject, setSelectedSubject] = useState(null)
  const [subjectFormData, setSubjectFormData] = useState({ name: '', type: '', hours: '', lecturerId: '', rokSemestr: '', tryb: '' })
  const [classes, setClasses] = useState([])
  const [selectedClass, setSelectedClass] = useState(null)
  const [classFormData, setClassFormData] = useState({ subjectId: '', lecturerId: '', type: '', time: '', roomId: '', groupId: '' })

  const [saving, setSaving] = useState(false)
  const [formStatus, setFormStatus] = useState({ type: '', message: '' })

  // state dla formularza przydziału studenta do grupy
  const [assignStudentFormData, setAssignStudentFormData] = useState({ studentIds: [], zajeciaId: '', ilosc: '1' })
  const [groupsData, setGroupsData] = useState([])
  const [selectedGroupId, setSelectedGroupId] = useState(null)
  // Filter states for students
  const [filterRokSemestr, setFilterRokSemestr] = useState('');
  const [filterTryb, setFilterTryb] = useState('');
  const [filterSpecjalnosc, setFilterSpecjalnosc] = useState('');


  useEffect(() => {
    if (activeView === 'students' || activeView === null || activeView === 'assignStudentToGroup' || activeView === 'groups' || activeView === 'groupDetails' || activeView === 'addStudent' || activeView === 'editStudent') {
      fetchStudents()
    }
    if (activeView === 'lecturers') {
      fetchLecturers()
    }
    if (activeView === 'subjects' || activeView === 'assignStudentToGroup' || activeView === 'groups' || activeView === 'groupDetails') {
      fetchSubjects()
    }
    if (activeView === 'classes' || activeView === 'addClass' || activeView === 'editClass' || activeView === 'assignStudentToGroup' || activeView === 'groups' || activeView === 'groupDetails' || activeView === 'addStudent' || activeView === 'editStudent') {
      fetchClasses()
      fetchSubjects()
      fetchRooms()
    }
    if (activeView === 'groups' || activeView === 'groupDetails') {
      fetchGroupsData()
    }
    // Reset bulk delete mode when changing views
    if (activeView !== 'students') {
      setIsBulkDeleteMode(false);
      setSelectedStudentIds([]);
    }
  }, [activeView])

  const enrichedClasses = useMemo(() => {
    return classes.map((c) => {
      const s = subjects.find((subj) => subj.id === c.subjectId)
      return {
        ...c,
        subjectName: s ? s.name : `Przedmiot ${c.subjectId}`,
        subjectNameForDisplay: c.subjectNameForDisplay ?? s?.name ?? `Przedmiot ${c.subjectId}`,
        semestr: c.semestr ?? s?.semestr ?? null,
      }
    })
  }, [classes, subjects])

  const enrichedSubjects = useMemo(() => {
    return subjects.map(s => {
      const l = lecturers.find(lect => lect.id === s.lecturerId);
      return {
        ...s,
        lecturerName: l ? `${l.firstName} ${l.lastName}`.trim() : null,
        imie: l?.firstName || null,
        nazwisko: l?.lastName || null,
        tytul_naukowy: l?.title || null,
      };
    });
  }, [subjects, lecturers]);


  const enrichedStudents = useMemo(() => {
    return students.map(s => {
      // Apply filters here before mapping groupLabel
      // Note: Filtering is done on the original 'students' array, then mapped.
      // This ensures that groupLabel is calculated only for visible students.
      if (filterRokSemestr && s.rok_semestr !== filterRokSemestr) return null;
      if (filterTryb && s.tryb !== filterTryb) return null;
      if (filterSpecjalnosc && s.specjalnosc !== filterSpecjalnosc) return null;

      const assignments = groupsData.filter(g => Number(g.student_id) === Number(s.id));
      const labels = assignments.map(g => {
        const cls = classes.find(c => c.id === g.zajecia_id);
        if (!cls) return null;
        const subject = subjects.find(sub => sub.id === cls.subjectId);
        return `${subject?.name || '?'}${cls.groupId ? ` (Gr. ${cls.groupId})` : ''}`;
      }).filter(Boolean);

      return { ...s, groupLabel: labels.length > 0 ? labels.join(', ') : '-' };
    }).filter(Boolean); // Filter out nulls from the map if any student didn't match filters
  }, [students, classes, subjects, groupsData, filterRokSemestr, filterTryb, filterSpecjalnosc]);

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/student', { cache: 'no-store' })
      if (!response.ok) {
        throw new Error('Błąd pobierania listy studentów')
      }
      const data = await response.json()
      setStudents(data.map((row) => ({
        id: row.idstudent,
        indexNumber: row.nr_albumu?.toString() || '',
        userId: row.uzytkownicy_id || null,
        login: row.user_login || '',
        rok_semestr: row.rok_semestr ?? '',
        tryb: row.tryb ?? '',
        specjalnosc: row.specjalnosc ?? '',
      })))
    } catch (error) {
      console.error(error)
    }
  }

  const fetchGroupsData = async () => {
    try {
      const response = await fetch('/api/grupa')
      if (!response.ok) throw new Error('Błąd pobierania danych grup')
      const data = await response.json()
      setGroupsData(data || [])
    } catch (err) {
      console.error(err)
    }
  }

  const fetchLecturers = async () => {
    try {
      const response = await fetch('/api/wykladowca')
      if (!response.ok) {
        throw new Error('Błąd pobierania listy wykładowców')
      }
      const data = await response.json()
      setLecturers(data.map((row) => ({
        id: row.idwykladowca,
        userId: row.uzytkownicy_id,
        login: row.user_login || row.login || '',
        firstName: row.imie || '',
        lastName: row.nazwisko || '',
        title: row.tytul_naukowy || '',
      })))
    }catch (error) {
      console.error(error)
    }
  }

  const fetchSubjects = async () => {
    try {
      const response = await fetch('/api/przedmiot')
      if (!response.ok) {
        throw new Error('Błąd pobierania listy przedmiotów')
      }
      const data = await response.json()
      setSubjects(data.map((row) => ({
        id: row.idprzedmiotu,
        name: row.nazwa || '',
        type: row.typ || '',
        hours: row.ilosc_godz?.toString() || '',
        lecturerId: row.wykladowca_id,
        semestr: row.semestr || '',
        tryb: row.tryb || '',
      })))
    } catch (error) {
      console.error(error)
    }
  }

  const [rooms, setRooms] = useState([])
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [roomFormData, setRoomFormData] = useState({ nazwa: '', budynek: '', limit_studentow: '' })

  useEffect(() => {
    if (activeView === 'rooms' || activeView === 'addRoom' || activeView === 'editRoom') {
      fetchRooms()
    }
  }, [activeView])

  const fetchRooms = async () => {
    try {
      const response = await fetch('/api/sale')
      if (!response.ok) {
        throw new Error('Błąd pobierania listy sal')
      }
      const data = await response.json()
      setRooms(data || [])
    } catch (error) {
      console.error(error)
    }
  }

  const fetchClasses = async () => {
    try {
      const response = await fetch('/api/zajecia', { cache: 'no-store' })
      if (!response.ok) {
        throw new Error('Błąd pobierania listy zajęć')
      }
      const data = await response.json()
      setClasses(data.map((row) => ({
        id: row.idzajecia,
        subjectId: row.przedmiot_id,
        subjectNameForDisplay: row.subject_name_for_display || null,
        semestr: row.semestr_for_display || null,
        wykladowcaId: row.wykladowca_id ?? null,
        wykladowca_imie: row.wykladowca_imie || null,
        wykladowca_nazwisko: row.wykladowca_nazwisko || null,
        type: row.typ || '',
        time: row.czas || '',
        salaId: row.sala_id ?? null,
        groupId: row.grupa ?? null,
      })))
    } catch (error) {
      console.error(error)
    }
  }


  const parseCsv = (text) => {
    const normalizeValue = (value) => value.trim().replace(/^"|"$/g, '')
    const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
    const rows = lines.map((line) => {
      const result = []
      let current = ''
      let insideQuotes = false
      for (let i = 0; i < line.length; i += 1) {
        const char = line[i]
        if (char === '"') {
          insideQuotes = !insideQuotes
          continue
        }
        if (!insideQuotes && (char === ',' || char === ';')) {
          result.push(normalizeValue(current))
          current = ''
          continue
        }
        current += char
      }
      if (current.length > 0 || line.endsWith(',') || line.endsWith(';')) {
        result.push(normalizeValue(current))
      }
      return result
    })

    if (rows.length === 0) {
      return []
    }

    const headerRow = rows[0]
    const headerFields = headerRow.map((value) => value.toLowerCase())
    const knownFields = ['nr_albumu', 'uzytkownicy_id', 'imie', 'nazwisko', 'tytul_naukowy', 'wykladowca_id', 'nazwa', 'typ', 'ilosc_godz', 'przedmiot_id', 'czas', 'indexnumber', 'userid', 'firstname', 'lastname', 'title', 'name', 'type', 'hours']
    const hasHeader = headerFields.some((field) => knownFields.includes(field))
    if (!hasHeader) {
      return rows
    }

    return rows.slice(1).map((row) => {
      const entry = {}
      row.forEach((value, index) => {
        const field = headerFields[index]
        entry[field] = value
      })
      return entry
    })
  }

  const mapCsvRowToPayload = (row, target) => {
    // Tworzymy znormalizowaną wersję wiersza (małe litery, bez spacji w kluczach)
    // ułatwia to dopasowanie nagłówków z Excela (np. "Nr albumu" -> "nralbumu")
    const normalizedRow = {};
    if (!Array.isArray(row)) {
      Object.keys(row).forEach(key => {
        const normKey = key.toLowerCase().trim().replace(/[\s_]/g, '');
        normalizedRow[normKey] = row[key];
      });
    }

    const getValue = (keys) => {
      if (Array.isArray(row)) return null; // Fallback dla starego parsera CSV
      for (const key of keys) {
        const searchKey = key.toLowerCase().trim().replace(/[\s_]/g, '');
        if (normalizedRow[searchKey] != null && normalizedRow[searchKey] !== '') {
          return normalizedRow[searchKey]
        }
      }
      return null
    }

    if (target === 'student') {
      let raw = null
      let login = null
      let haslo = null
      let rok_semestr = null
      let tryb = null
      let specjalnosc = null
      let zajecia_id = null
      const emptyToNull = (v) => {
        if (v == null) return null
        if (typeof v === 'string' && v.trim() === '') return null
        return v
      }

      if (Array.isArray(row)) {
        // Fallback index-based (może się rozjechać przy trailing commas).
        // Priorytetem i tak są klucze header-based, jeśli parseCsv zwróci obiekty.
        raw = row[0]
        login = row[1]
        haslo = row[2]
        rok_semestr = row[3]
        tryb = row[4]
        specjalnosc = row[5]
        zajecia_id = row[6]
      } else {
        // Header-based mapping (dla Twojego CSV: rok_semestr, tryb, ...).
        raw = getValue(['nr_albumu', 'indexnumber', 'nr albumu'])
        login = getValue(['login'])
        haslo = getValue(['haslo', 'password'])
        rok_semestr = getValue(['rok_semestr'])
        tryb = getValue(['tryb', 'mode'])
        specjalnosc = getValue(['specjalnosc', 'specialty'])
        zajecia_id = getValue(['zajecia_id', 'classid', 'class_id'])
      }

      const number = raw != null ? Number(raw) : null
      const zajeciaIdNum = zajecia_id != null ? Number(zajecia_id) : null
      return {
        nr_albumu: Number.isNaN(number) ? null : number,
        login: emptyToNull(login),
        password: emptyToNull(haslo),
        rok_semestr: emptyToNull(rok_semestr) || '2024/1',
        tryb: emptyToNull(tryb) || 'STAC',
        specjalnosc: emptyToNull(specjalnosc) || '',
        zajecia_id: Number.isNaN(zajeciaIdNum) ? null : zajeciaIdNum,
      }
    }

    if (target === 'lecturer') {
      let userId = null
      let imie = null
      let nazwisko = null
      let tytul = null
      if (Array.isArray(row)) {
        // expected order: imie, nazwisko, tytul_naukowy, uzytkownicy_id (optional)
        imie = row[0] || null
        nazwisko = row[1] || null
        tytul = row[2] || null
        userId = row[3] || null
      } else {
        userId = getValue(['uzytkownicy_id', 'userid'])
        imie = getValue(['imie', 'firstname'])
        nazwisko = getValue(['nazwisko', 'lastname'])
        tytul = getValue(['tytul_naukowy', 'title'])
      }
      return {
        uzytkownicy_id: userId ? Number(userId) : null,
        imie: imie,
        nazwisko: nazwisko,
        tytul_naukowy: tytul,
      }
    }

    if (target === 'subject') {
      let lecturerId = null
      let nazwa = null
      let typ = null
      let ilosc_godz = null
      let semestr = null
      let tryb = null
      if (Array.isArray(row)) {
        // expected order: nazwa, typ, ilosc_godz, wykladowca_id (optional)
        nazwa = row[0] || null
        typ = row[1] || null
        ilosc_godz = row[2] != null && row[2] !== '' ? Number(row[2]) : null
        lecturerId = row[3] || null
        semestr = row[4] || null
        tryb = row[5] || null
      } else {
        lecturerId = getValue(['wykladowca_id', 'userid', 'lecturerid'])
        nazwa = getValue(['nazwa', 'name'])
        typ = getValue(['typ', 'type'])
        semestr = getValue(['semestr', 'rok_semestr'])
        tryb = getValue(['tryb'])
        const hoursRaw = getValue(['ilosc_godz', 'hours'])
        ilosc_godz = hoursRaw != null ? Number(hoursRaw) : null
      }
      return {
        wykladowca_id: lecturerId ? Number(lecturerId) : null,
        nazwa,
        typ,
        ilosc_godz: Number.isNaN(ilosc_godz) ? null : ilosc_godz,
        semestr,
        tryb,
      }
    }

    if (target === 'class') {
      let subjectId = null
      let typ = null
      let czas = null
      let wykladowca_id = null
      let sala_id = null
      let grupa = null
      if (Array.isArray(row)) {
        // expected order: przedmiot_id, typ, czas, wykladowca_id, sala_id, grupa
        subjectId = row[0] || null
        typ = row[1] || null
        czas = row[2] || null
        wykladowca_id = row[3] || null
        sala_id = row[4] || null
        grupa = row[5] || null
      } else {
        subjectId = getValue(['przedmiot_id', 'subjectid', 'subjectId'])
        typ = getValue(['typ', 'type'])
        czas = getValue(['czas', 'time'])
        wykladowca_id = getValue(['wykladowca_id', 'lecturerid'])
        sala_id = getValue(['sala_id', 'roomid'])
        grupa = getValue(['grupa', 'groupid'])
      }
      return {
        przedmiot_id: subjectId ? Number(subjectId) : null,
        wykladowca_id: wykladowca_id ? Number(wykladowca_id) : null,
        typ,
        czas,
        sala_id: sala_id ? Number(sala_id) : null,
        grupa: grupa ? Number(grupa) : null,
      }
    }

    return null
  }

  const importCsvRecords = async (records, target) => {
    if (!records.length) {
      setFormStatus({ type: 'error', message: 'Plik CSV nie zawiera danych.' })
      return
    }

    const endpoint = target === 'student'
      ? '/api/student'
      : target === 'lecturer'
      ? '/api/wykladowca'
      : target === 'class'
      ? '/api/zajecia'
      : '/api/przedmiot'
    const results = await Promise.all(records.map(async (row, index) => {
      const payload = mapCsvRowToPayload(row, target)
      if (!payload) {
        return { index, ok: false, message: 'Niepoprawny wiersz CSV' }
      }
      try {
        const isStudentImport = target === 'student'

        if (isStudentImport) {
          console.log('CSV import payload (student):', payload)
        }

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        const result = await response.json().catch(() => ({}))

        if (isStudentImport) {
          console.log('CSV import response (student):', {
            status: response.status,
            ok: response.ok,
            body: result,
          })
          if (!response.ok) {
            console.log('CSV import error details (student):', {
              message: result?.error || result?.message,
              errors: result?.errors,
              payload,
            })
          }
        }

        if (!response.ok) {
          return { index, ok: false, message: result.error || result.message || 'Błąd zapisu' }
        }

        return { index, ok: true }
      } catch (err) {
        return { index, ok: false, message: err.message }
      }
    }))

    const successCount = results.filter((item) => item.ok).length
    const failCount = results.length - successCount
    const summary = `Zaimportowano ${successCount} rekordów` + (failCount ? `, ${failCount} nie powiodło się` : '')
    setFormStatus({ type: failCount ? 'error' : 'success', message: summary })

    if (target === 'student') await fetchStudents()
    if (target === 'lecturer') await fetchLecturers()
    if (target === 'subject') await fetchSubjects()
    if (target === 'class') await fetchClasses()
  }

  const triggerImport = (target) => {
    setImportTarget(target)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
      fileInputRef.current.click()
    }
  }

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    const text = await file.text()
    const rows = parseCsv(text)
    if (rows.length) {
      await importCsvRecords(rows, importTarget)
    }
    event.target.value = ''
  }

  const resetForm = () => {
    setSelectedStudent(null)
    setFormData({ indexNumber: '', login: '', password: '', zajeciaId: '' })
    setSelectedLecturer(null)
    setLecturerFormData({ userId: '', firstName: '', lastName: '', title: '', login: '', password: '', availabilityGrid: {} })
    setSelectedSubject(null)
    setSubjectFormData({ name: '', type: '', hours: '', lecturerId: '', rokSemestr: '', tryb: '' })
    setSelectedClass(null)
    setClassFormData({ subjectId: '', lecturerId: '', type: '', time: '', roomId: '', groupId: '' })
    setFormStatus({ type: '', message: '' })
  }


  const handleBack = () => {
    setActiveView(null)
    resetForm()
  }

  const handleLogout = () => {
    if (typeof onLogout === 'function') {
      onLogout()
      return
    }
    window.location.reload()
  }

  const pageStyle = {
    fontSize: `${fontScale}%`,
    filter: `contrast(${contrast}%)`,
  }

  const renderHeader = () => (
    <div className="student-menu-header">
      <div className="student-menu-user">
        <div>
          <strong>Menu administratora</strong>
          <div className="student-menu-user-info">Jesteś zalogowany jako {user?.login || user?.rola || 'administrator'}</div>
        </div>
      </div>

      <div className="student-menu-accessibility">
        <button type="button" onClick={() => setFontScale((prev) => Math.min(prev + 10, 160))}>
          A+
        </button>
        <button type="button" onClick={() => setFontScale((prev) => Math.max(prev - 10, 80))}>
          A-
        </button>
        <button type="button" onClick={() => setContrast((prev) => Math.min(prev + 15, 200))}>
          K+
        </button>
        <button type="button" onClick={() => setContrast((prev) => Math.max(prev - 15, 80))}>
          K-
        </button>
      </div>
    </div>
  )

  const handleFormChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleLecturerFormChange = (event) => {
    const { name, value } = event.target
    setLecturerFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubjectFormChange = (event) => {
    const { name, value } = event.target
    setSubjectFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleClassFormChange = (event) => {
    const { name, value } = event.target
    setClassFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleDeleteStudent = async (id) => {
    try {
      setFormStatus({ type: '', message: '' })
      const response = await fetch(`/api/student/${id}`, { method: 'DELETE' })
      if (!response.ok) {
        throw new Error(await parseApiError(response, 'Nie udało się usunąć studenta'))
      }
      await fetchStudents()
      setFormStatus({ type: 'success', message: 'Usunięto studenta' })
    } catch (error) {
      console.error(error)
      setFormStatus({ type: 'error', message: error.message || 'Nie udało się usunąć studenta' })
    }
  }

  const handleDeleteLecturer = async (id) => {
    try {
      setFormStatus({ type: '', message: '' })
      const response = await fetch(`/api/wykladowca/${id}`, { method: 'DELETE' })
      if (!response.ok) {
        throw new Error(await parseApiError(response, 'Nie udało się usunąć wykładowcy'))
      }
      await Promise.all([fetchLecturers(), fetchSubjects(), fetchClasses()])
      setFormStatus({ type: 'success', message: 'Usunięto wykładowcę oraz powiązane przedmioty i zajęcia' })
    } catch (error) {
      console.error(error)
      setFormStatus({ type: 'error', message: error.message || 'Nie udało się usunąć wykładowcy' })
    }
  }

  const handleEditLecturer = (lecturer) => {
    setSelectedLecturer(lecturer)
    setLecturerFormData({
      userId: lecturer.userId?.toString() || '',
      firstName: lecturer.firstName || '',
      lastName: lecturer.lastName || '',
      title: lecturer.title || '',
      login: lecturer.login || '',
      password: '',
      availabilityGrid: lecturer.availabilityGrid || {},
    })
    setActiveView('editLecturer')
  }

  const handleDeleteSubject = async (id) => {
    try {
      setFormStatus({ type: '', message: '' })
      const response = await fetch(`/api/przedmiot/${id}`, { method: 'DELETE' })
      if (!response.ok) {
        throw new Error(await parseApiError(response, 'Nie udało się usunąć przedmiotu'))
      }
      await Promise.all([fetchSubjects(), fetchClasses()])
      setFormStatus({ type: 'success', message: 'Usunięto przedmiot oraz powiązane zajęcia' })
    } catch (error) {
      console.error(error)
      setFormStatus({ type: 'error', message: error.message || 'Nie udało się usunąć przedmiotu' })
    }
  }

  const handleEditSubject = (subject) => {
    setSelectedSubject(subject)
    setSubjectFormData({
      name: subject.name,
      type: subject.type,
      hours: subject.hours,
      lecturerId: subject.lecturerId?.toString() || '',
      rokSemestr: subject.semestr || '',
      tryb: subject.tryb || '',
    })
    setActiveView('editSubject')
  }

  const handleDeleteClass = async (id) => {
    try {
      setFormStatus({ type: '', message: '' })
      const response = await fetch(`/api/zajecia/${id}`, { method: 'DELETE' })
      if (!response.ok) {
        throw new Error(await parseApiError(response, 'Nie udało się usunąć zajęć'))
      }
      await fetchClasses()
      setFormStatus({ type: 'success', message: 'Usunięto zajęcia' })
    } catch (error) {
      console.error(error)
      setFormStatus({ type: 'error', message: error.message || 'Nie udało się usunąć zajęć' })
    }
  }

  const handleEditClass = (classItem) => {
    // Ponieważ lista zajęć wyświetla nazwy zamiast ID, 
    // musimy odnaleźć oryginalny rekord w stanie classes, aby formularz otrzymał poprawne ID.
    const original = classes.find((c) => c.id === classItem.id) || classItem
    setSelectedClass(original)
    setClassFormData({
      subjectId: original.subjectId?.toString() || '',
      lecturerId: original.wykladowcaId != null ? String(original.wykladowcaId) : '',
      type: original.type,
      time: original.time,
      roomId: original.salaId != null ? original.salaId.toString() : '',
      groupId: original.groupId || '',
    })
    setActiveView('editClass')
  }


  const handleEditStudent = (student) => {
    setSelectedStudent(student)
    setFormData({
      indexNumber: student.indexNumber,
      login: student.login || '',
      password: '',
      rokSemestr: student.rok_semestr ?? '',
      tryb: student.tryb ?? '',
      specjalnosc: student.specjalnosc ?? '',
    })
    setActiveView('editStudent')
  }

  const parseApiError = async (response, defaultMessage) => {
    const result = await response.json().catch(() => ({}))
    if (Array.isArray(result.errors)) {
      return result.errors.map((error) => error.msg || error.message).join('; ')
    }
    return result.error || result.message || defaultMessage
  }

  const handleToggleStudentSelection = (studentId) => {
    setSelectedStudentIds(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };


  // View component renders list and actions
  const renderStudentListView = () => (
    <>
      <StudentList
        style={pageStyle}
        user={user}
        students={enrichedStudents}
        onAdd={() => { resetForm(); setActiveView('addStudent') }}
        isBulkDeleteMode={isBulkDeleteMode}
        selectedStudentIds={selectedStudentIds}
        onToggleSelection={handleToggleStudentSelection}
        setIsBulkDeleteMode={setIsBulkDeleteMode}
        onAssign={() => setActiveView('assignStudentToGroup')}
        onEdit={(s) => handleEditStudent(s)}
        onDelete={(id) => handleDeleteStudent(id)}
        onBack={handleBack}
        onImportCsv={() => triggerImport('student')}
        onImportExcel={() => triggerImport('student')}
        status={formStatus}
        filterRokSemestr={filterRokSemestr}
        filterTryb={filterTryb}
        filterSpecjalnosc={filterSpecjalnosc}
        onFilterChange={(name, value) => {
          if (name === 'rokSemestr') setFilterRokSemestr(value);
          else if (name === 'tryb') setFilterTryb(value);
          else if (name === 'specjalnosc') setFilterSpecjalnosc(value);
        }}
        onBulkDelete={async () => {
          if (selectedStudentIds.length === 0) {
            setFormStatus({ type: 'error', message: 'Nie wybrano żadnych studentów.' });
            return;
          }
          try {
            const response = await fetch('/api/student', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids: selectedStudentIds }) });
            if (!response.ok) throw new Error(await parseApiError(response, 'Nie udało się usunąć studentów'));
            await fetchStudents();
            setFormStatus({ type: 'success', message: `Usunięto ${selectedStudentIds.length} studentów.` });
            setSelectedStudentIds([]);
            setIsBulkDeleteMode(false);
          } catch (error) {
            setFormStatus({ type: 'error', message: error.message });
          }
        }}
      />
    </>
  )

  const renderStudentFormView = (title) => (
    activeView === 'addStudent' ? (
      <AddStudent
        style={pageStyle}
        title={title}
        formData={formData}
        status={formStatus}
        classes={enrichedClasses}
        onChange={(fd) => setFormData(fd)}
        onCancel={() => setActiveView('students')}
        onSave={async (payload) => {
          setSaving(true)
          setFormStatus({ type: '', message: '' })
          try {
            const response = await fetch('/api/student', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                nr_albumu: payload.indexNumber,
                login: payload.login || String(payload.indexNumber),
                password: payload.password || 'student',
                rok_semestr: payload.rok_semestr || payload.rokSemestr,
                tryb: payload.tryb,
                specjalnosc: payload.specjalnosc
              }),
            })
            const result = await response.json()
            if (!response.ok) throw new Error(result.error || result.message || 'Błąd zapisu studenta')
            setFormStatus({ type: 'success', message: 'Dodano nowego studenta' })
            await fetchStudents()
            setSelectedStudent(null)
            setActiveView('students')
            resetForm()
          } catch (err) {
            console.error(err)
            setFormStatus({ type: 'error', message: err.message || 'Błąd zapisu studenta' })
          } finally {
            setSaving(false)
          }
        }}
      />
    ) : (
      <EditStudent
        style={pageStyle}
        title={title}
        formData={formData}
        status={formStatus}
        classes={enrichedClasses}
        onChange={(fd) => setFormData(fd)}
        student={selectedStudent}
        onCancel={() => setActiveView('students')}
        onSave={async (payload) => {
          setSaving(true)
          setFormStatus({ type: '', message: '' })
          try {
            const response = await fetch(`/api/student/${selectedStudent.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                nr_albumu: payload.indexNumber,
                login: payload.login,
                password: payload.password,
                rok_semestr: payload.rok_semestr || payload.rokSemestr,
                tryb: payload.tryb,
                specjalnosc: payload.specjalnosc
              }),
            })
            const result = await response.json()
            if (!response.ok) throw new Error(result.error || result.message || 'Błąd zapisu studenta')
            setFormStatus({ type: 'success', message: 'Zaktualizowano dane studenta' })
            await fetchStudents()
            setSelectedStudent(null)
            setActiveView('students')
            resetForm()
          } catch (err) {
            console.error(err)
            setFormStatus({ type: 'error', message: err.message || 'Błąd zapisu studenta' })
          } finally {
            setSaving(false)
          }
        }}
      />
    )
  )
  

  const handleSubmitLecturer = async (payload) => {
    setSaving(true)
    setFormStatus({ type: '', message: '' })
    try {
      const url = selectedLecturer ? `/api/wykladowca/${selectedLecturer.id}` : '/api/wykladowca'
      const method = selectedLecturer ? 'PUT' : 'POST'
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          grupa: payload.grupa ? Number(payload.grupa) : null,
        }),
      })
      if (!response.ok) {
        const errorMessage = await parseApiError(response, 'Błąd zapisu wykładowcy')
        throw new Error(errorMessage)
      }
      setFormStatus({
        type: 'success',
        message: selectedLecturer ? 'Zaktualizowano dane wykładowcy' : 'Dodano nowego wykładowcę',
      })
      setSelectedLecturer(null)
      setActiveView('lecturers')
      resetForm()
      await fetchLecturers()
    } catch (error) {
      console.error(error)
      setFormStatus({ type: 'error', message: error.message || 'Błąd zapisu wykładowcy' })
    } finally {
      setSaving(false)
    }
  }

  const renderLecturerListView = () => (
    <>
      <LecturerList
        style={pageStyle}
        user={user}
        lecturers={lecturers}
        onAdd={() => { resetForm(); setActiveView('addLecturer') }}
        onEdit={(lecturer) => handleEditLecturer(lecturer)}
        onDelete={(id) => handleDeleteLecturer(id)}
        onBack={handleBack}
        onImportCsv={() => triggerImport('lecturer')}
        onImportExcel={() => triggerImport('lecturer')}
        status={formStatus}
      />
    </>
  )

  const renderLecturerFormView = (title) => (
    activeView === 'addLecturer' ? (
      <AddLecturer
        style={pageStyle}
        title={title}
        formData={lecturerFormData}
        status={formStatus}
        onChange={handleLecturerFormChange}
        onCancel={() => setActiveView('lecturers')}
        onSave={async (payload) => {
          await handleSubmitLecturer(payload)
        }}
      />
    ) : (
      <EditLecturer
        style={pageStyle}
        title={title}
        formData={lecturerFormData}
        status={formStatus}
        onChange={handleLecturerFormChange}
        lecturer={selectedLecturer}
        onCancel={() => setActiveView('lecturers')}
        onSave={async (payload) => {
          await handleSubmitLecturer(payload)
        }}
      />
    )
  )

  const handleSubmitSubject = async (payload) => {
    setSaving(true)
    setFormStatus({ type: '', message: '' })
    try {
      const url = selectedSubject ? `/api/przedmiot/${selectedSubject.id}` : '/api/przedmiot'
      const method = selectedSubject ? 'PUT' : 'POST'
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!response.ok) {
        const errorMessage = await parseApiError(response, 'Błąd zapisu przedmiotu')
        throw new Error(errorMessage)
      }
      setFormStatus({
        type: 'success',
        message: selectedSubject ? 'Zaktualizowano dane przedmiotu' : 'Dodano nowy przedmiot',
      })
      setSelectedSubject(null)
      setActiveView('subjects')
      resetForm()
      await fetchSubjects()
    } catch (error) {
      console.error(error)
      setFormStatus({ type: 'error', message: error.message || 'Błąd zapisu przedmiotu' })
    } finally {
      setSaving(false)
    }
  }

  const renderSubjectListView = () => (
    <>
      <SubjectList
        style={pageStyle}
        user={user}
        subjects={subjects}
        onAdd={() => { resetForm(); setActiveView('addSubject') }}
        onEdit={(subject) => handleEditSubject(subject)}
        onDelete={(id) => handleDeleteSubject(id)}
        onBack={handleBack}
        onImportCsv={() => triggerImport('subject')}
        onImportExcel={() => triggerImport('subject')}
        status={formStatus}
      />
    </>
  )

  const renderSubjectFormView = (title) => (
    activeView === 'addSubject' ? (
      <AddSubject
        style={pageStyle}
        title={title}
        formData={subjectFormData}
        status={formStatus}
        lecturers={lecturers}
        onChange={handleSubjectFormChange}
        onCancel={() => setActiveView('subjects')}
        onSave={async (payload) => {
          await handleSubmitSubject(payload)
        }}
      />
    ) : (
      <EditSubject
        style={pageStyle}
        title={title}
        formData={subjectFormData}
        status={formStatus}
        lecturers={lecturers}
        onChange={handleSubjectFormChange}
        subject={selectedSubject}
        onCancel={() => setActiveView('subjects')}
        onSave={async (payload) => {
          await handleSubmitSubject(payload)
        }}
      />
    )
  )

  const renderClassFormView = (title) => (
    activeView === 'addClass' ? (
      <AddZajecia
        style={pageStyle}
        title={title}
        formData={classFormData}
        status={formStatus}
        subjects={enrichedSubjects}
        rooms={rooms}
        lecturers={lecturers}
        onChange={handleClassFormChange}
        onCancel={() => setActiveView('classes')}
        onSave={async (payload) => {
          await handleSubmitClass(payload)
        }}
      />
    ) : (
      <EditZajecia
        style={pageStyle}
        title={title}
        classData={selectedClass}
        formData={classFormData}
        status={formStatus}
        subjects={enrichedSubjects}
        rooms={rooms}
        lecturers={lecturers}
        onChange={handleClassFormChange}
        onCancel={() => setActiveView('classes')}
        onSave={async (payload) => {
          await handleSubmitClass(payload)
        }}
      />
    )
  )

  const handleSubmitClass = async (payload) => {
    setSaving(true)
    setFormStatus({ type: '', message: '' })
    try {
      const url = selectedClass ? `/api/zajecia/${selectedClass.id}` : '/api/zajecia'
      const method = selectedClass ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!response.ok) {
        const errorMessage = await parseApiError(response, 'Błąd zapisu zajęć')
        throw new Error(errorMessage)
      }
      setFormStatus({
        type: 'success',
        message: selectedClass ? 'Zaktualizowano dane zajęć' : 'Dodano nowe zajęcia',
      })
      setSelectedClass(null)
      setActiveView('classes')
      resetForm()
      await fetchClasses()
    } catch (error) {
      console.error(error)
      setFormStatus({ type: 'error', message: error.message || 'Błąd zapisu zajęć' })
    } finally {
      setSaving(false)
    }
  }

  const renderClassListView = () => (
    <ZajeciaList
      style={pageStyle}
      user={user}
      classes={enrichedClasses.map((classItem) => {
        const room = rooms.find((r) => (r.id_sala ?? r.id) === classItem.salaId)
        return {
          ...classItem,
          salaNameForDisplay: room ? room.nazwa : (classItem.salaId ?? ''),
        }
      })}
      onAdd={() => { resetForm(); setActiveView('addClass') }}
      onEdit={(classItem) => handleEditClass(classItem)}
      onAssignLecturer={(classItem) => handleEditClass(classItem)}
      onDelete={(id) => handleDeleteClass(id)}
      onBack={handleBack}
      onImportCsv={() => triggerImport('class')}
      onImportExcel={() => triggerImport('class')}
      status={formStatus}
    />
  )

  const renderContent = () => {
    if (activeView === 'students') return renderStudentListView()
    if (activeView === 'addStudent') return renderStudentFormView('Dodaj studenta')
    if (activeView === 'editStudent') return renderStudentFormView('Edytuj studenta')
    if (activeView === 'lecturers') return renderLecturerListView()
    if (activeView === 'addLecturer') return renderLecturerFormView('Dodaj wykładowcę')
    if (activeView === 'editLecturer') return renderLecturerFormView('Edytuj wykładowcę')
    if (activeView === 'subjects') return renderSubjectListView()
    if (activeView === 'addSubject') return renderSubjectFormView('Dodaj przedmiot')
    if (activeView === 'editSubject') return renderSubjectFormView('Edytuj przedmiot')
    if (activeView === 'classes') return renderClassListView()
    if (activeView === 'addClass') return renderClassFormView('Dodaj zajęcia')
    if (activeView === 'editClass') return renderClassFormView('Edytuj zajęcia')

    if (activeView === 'rooms') return (
      <RoomList
        style={pageStyle}
        rooms={rooms}
        onAdd={() => { setRoomFormData({ nazwa: '', budynek: '', limit_studentow: '' }); setActiveView('addRoom') }}
        onEdit={(room) => {
          setSelectedRoom(room);
          setRoomFormData({ nazwa: room.nazwa || '', budynek: room.budynek || '', limit_studentow: room.limit_studentow != null ? String(room.limit_studentow) : '' });
          setActiveView('editRoom');
        }}
        onDelete={async (id) => {
          try {
            const response = await fetch(`/api/sale/${id}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Błąd usuwania');
            await fetchRooms();
            setFormStatus({ type: 'success', message: 'Usunięto salę' });
          } catch (err) { setFormStatus({ type: 'error', message: err.message }); }
        }}
        onBack={handleBack}
        status={formStatus}
      />
    )

    if (activeView === 'addRoom') return (
      <AddRoom
        style={pageStyle}
        title="Dodaj salę"
        formData={roomFormData}
        status={formStatus}
        onChange={setRoomFormData}
        onCancel={() => setActiveView('rooms')}
        onSave={async (payload) => {
          const requestId = `${Date.now()}-${Math.random().toString(16).slice(2)}`
          console.log('[DEBUG][AssignStudentToGroup][onSave] requestId=', requestId)
          console.log('[DEBUG][AssignStudentToGroup][onSave] payload=', payload)
          try {
            const response = await fetch('/api/sale', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
            if (!response.ok) throw new Error('Błąd zapisu')
            await fetchRooms()
            setActiveView('rooms')
          } catch (err) {
            setFormStatus({ type: 'error', message: err.message })
          }
        }} />
    )

    if (activeView === 'editRoom') return (
      <EditRoom
        style={pageStyle}
        title="Edytuj salę"
        room={selectedRoom}
        formData={roomFormData}
        onChange={setRoomFormData}
        onCancel={() => setActiveView('rooms')}
        status={formStatus}
        onSave={async (payload) => {
          try {
            if (!selectedRoom?.id_sala) throw new Error('Brak id sali');
            const response = await fetch(`/api/sale/${selectedRoom.id_sala}`, {
              method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
            });
            if (!response.ok) throw new Error('Błąd zapisu');
            await fetchRooms(); setActiveView('rooms');
          } catch (err) { setFormStatus({ type: 'error', message: err.message }); }
        }}
      />
    )

    if (activeView === 'groupDetails') return (
      <ViewGroupDetails
        style={pageStyle}
        subjectName={subjects.find(s => s.id === classes.find(c => c.id === selectedGroupId)?.subjectId)?.name || '?'}
        groupNr={classes.find(c => c.id === selectedGroupId)?.groupId || '-'}
        students={groupsData.filter(g => Number(g.zajecia_id) === Number(selectedGroupId)).map(g => {
          const s = students.find(s => s.id === g.student_id)
          return { ...s, id_grupa: g.id_grupa, ilosc: g.ilosc }
        })}
        onDeleteFromGroup={async (id_grupa, student_id) => {
          try {
            const entries = [{ id_grupa: id_grupa ?? null, student_id }]
            const response = await fetch('/api/grupa/student', {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(entries),
            })
            if (!response.ok) throw new Error('Błąd usuwania studenta z grupy')
            await fetchGroupsData()
            await fetchStudents()
            setFormStatus({ type: 'success', message: 'Usunięto studenta z grupy' })
          } catch (err) {
            setFormStatus({ type: 'error', message: err.message })
          }
        }}
        onBulkDeleteFromGroup={async (entries) => {
          try {
            const response = await fetch('/api/grupa/student', {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(entries),
            })
            if (!response.ok) throw new Error('Błąd usuwania studentów z grupy')
            await fetchGroupsData()
            await fetchStudents()
            setFormStatus({ type: 'success', message: `Usunięto ${entries.length} studentów z grupy` })
          } catch (err) {
            setFormStatus({ type: 'error', message: err.message })
          }
        }}

        onBack={() => setActiveView('groups')}
        status={formStatus}
      />
    )

    if (activeView === 'groups') return (
      <ViewGroupList
        style={pageStyle}
        groups={classes.map((c) => {
          const assigned = groupsData.filter((g) => Number(g.zajecia_id) === Number(c.id));
          return {
            id: c.id,
            subjectName: subjects.find((s) => s.id === c.subjectId)?.name || '?',
            roomName: rooms.find((r) => (r.id_sala ?? r.id) === c.salaId)?.nazwa || '-',
            type: c.type, time: c.time, groupId: c.groupId, count: assigned.length,
          };
        })}
        onViewDetails={(id) => { setSelectedGroupId(id); setActiveView('groupDetails'); }}
        onAssign={(id) => { setAssignStudentFormData(prev => ({ ...prev, zajeciaId: id })); setActiveView('assignStudentToGroup'); }}
        onBack={handleBack}
      />
    )

    if (activeView === 'assignStudentToGroup') return (
      <AssignStudentToGroup
        style={pageStyle}
        students={students}
        classes={enrichedClasses.map(c => ({ ...c, roomName: rooms.find(r => (r.id_sala ?? r.id) === c.salaId)?.nazwa || '-' }))}
        formData={assignStudentFormData}
        onChange={setAssignStudentFormData}
        onCancel={() => setActiveView('groups')}
        onSave={async (payload) => {
          const requestId = `${Date.now()}-${Math.random().toString(16).slice(2)}`
          console.log('[DEBUG][AssignStudentToGroup][onSave] requestId=', requestId)
          console.log('[DEBUG][AssignStudentToGroup][onSave] payload=', payload)
          try {
            // Poprawny komunikat: rzeczywista liczba wpisów z backendu
            const response = await fetch('/api/grupa', {

              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            })
            if (!response.ok) throw new Error(await parseApiError(response, 'Błąd zapisu podczas przydziału studentów'));

            const result = await response.json().catch(() => null)
            const createdCount = Array.isArray(result) ? result.length : (result ? 1 : (payload.student_ids?.length ?? 1))

            await fetchGroupsData();
            await fetchStudents();

            // Wyczyść formularz po udanym zapisie
            setAssignStudentFormData({ studentIds: [], zajeciaId: '' });
            setFormStatus({ type: 'success', message: `Przydzielono ${createdCount} studentów do grupy` });
            setActiveView('groups');
          } catch (err) { setFormStatus({ type: 'error', message: err.message }); }
        }}
        status={formStatus}
      />
    )

    // Domyślnie - Dashboard (Ekran Główny)
    console.log("Rendering default (main menu) view."); // Debugging
    return (
      <div className="student-menu-page" style={pageStyle}>
        {renderHeader()}
        <div className="student-menu-panel">
          <button type="button" onClick={() => setActiveView('students')}>Zarządzaj studentami</button>
          <button type="button" onClick={() => setActiveView('lecturers')}>Wyświetl listę wykładowców</button>
          <button type="button" onClick={() => setActiveView('subjects')}>Wyświetl listę przedmiotów</button>
          <button type="button" onClick={() => setActiveView('classes')}>Wyświetl listę zajęć</button>
          <button type="button" onClick={() => setActiveView('rooms')}>Wyświetl sale</button>
          <button type="button" onClick={() => setActiveView('groups')}>Zarządzaj grupami</button>
          <button type="button" onClick={() => { setAssignStudentFormData({ studentIds: [], zajeciaId: '', ilosc: '1' }); setActiveView('assignStudentToGroup'); }}>
            Przydziel studenta do grupy
          </button>
          <button type="button" onClick={handleLogout}>Wyloguj się</button>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-menu-container"> {/* Added a wrapper div */}
      {renderContent()} {/* This will render the active view or the main menu */}
      <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept=".csv" onChange={handleFileChange} />
    </div>
  )
}

export default AdminMenu
