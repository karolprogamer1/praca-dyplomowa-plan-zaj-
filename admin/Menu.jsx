import { useEffect, useState, useRef } from 'react'
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

function AdminMenu({ user, onLogout }) {
  const fileInputRef = useRef(null)
  const [activeView, setActiveView] = useState(null)
  const [fontScale, setFontScale] = useState(100)
  const [contrast, setContrast] = useState(100)
  const [importTarget, setImportTarget] = useState(null)
  const [students, setStudents] = useState([])
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [formData, setFormData] = useState({ indexNumber: '', firstName: '', lastName: '', login: '', password: '' })
  const [lecturers, setLecturers] = useState([])
  const [selectedLecturer, setSelectedLecturer] = useState(null)
  const [lecturerFormData, setLecturerFormData] = useState({ userId: '', firstName: '', lastName: '', title: '' })
  const [subjects, setSubjects] = useState([])
  const [selectedSubject, setSelectedSubject] = useState(null)
  const [subjectFormData, setSubjectFormData] = useState({ name: '', type: '', hours: '', lecturerId: '' })
  const [classes, setClasses] = useState([])
  const [selectedClass, setSelectedClass] = useState(null)
  const [classFormData, setClassFormData] = useState({ subjectId: '', type: '', time: '' })
  const [saving, setSaving] = useState(false)
  const [formStatus, setFormStatus] = useState({ type: '', message: '' })

  useEffect(() => {
    if (activeView === 'students' || activeView === null) {
      fetchStudents()
    }
    if (activeView === 'lecturers') {
      fetchLecturers()
    }
    if (activeView === 'subjects') {
      fetchSubjects()
    }
    if (activeView === 'classes' || activeView === 'addClass' || activeView === 'editClass') {
      fetchClasses()
      fetchSubjects()
    }
  }, [activeView])

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
        login: row.user_login || row.login || '',
        firstName: row.imie || '',
        lastName: row.nazwisko || '',
      })))
    } catch (error) {
      console.error(error)
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
        firstName: row.imie || '',
        lastName: row.nazwisko || '',
        title: row.tytul_naukowy || '',
      })))
    } catch (error) {
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
      })))
    } catch (error) {
      console.error(error)
    }
  }

  const fetchClasses = async () => {
    try {
      const response = await fetch('/api/zajecia')
      if (!response.ok) {
        throw new Error('Błąd pobierania listy zajęć')
      }
      const data = await response.json()
      setClasses(data.map((row) => ({
        id: row.idzajecia,
        subjectId: row.przedmiot_id,
        type: row.typ || '',
        time: row.czas || '',
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
    const getValue = (keys) => {
      for (const key of keys) {
        if (row[key] != null && row[key] !== '') {
          return row[key]
        }
      }
      return null
    }

    if (target === 'student') {
      const raw = typeof row === 'object' ? getValue(['nr_albumu', 'indexnumber', 'nr albumu']) : row[0]
      const number = raw != null ? Number(raw) : null
      return { nr_albumu: Number.isNaN(number) ? null : number }
    }

    if (target === 'lecturer') {
      const userId = getValue(['uzytkownicy_id', 'userid'])
      return {
        uzytkownicy_id: userId ? Number(userId) : null,
        imie: getValue(['imie', 'firstname']),
        nazwisko: getValue(['nazwisko', 'lastname']),
        tytul_naukowy: getValue(['tytul_naukowy', 'title']),
      }
    }

    if (target === 'subject') {
      const lecturerId = getValue(['wykladowca_id', 'userid', 'lecturerid'])
      const hoursRaw = getValue(['ilosc_godz', 'hours'])
      const hoursNumber = hoursRaw != null ? Number(hoursRaw) : null
      return {
        wykladowca_id: lecturerId ? Number(lecturerId) : null,
        nazwa: getValue(['nazwa', 'name']),
        typ: getValue(['typ', 'type']),
        ilosc_godz: Number.isNaN(hoursNumber) ? null : hoursNumber,
      }
    }

    if (target === 'class') {
      const subjectId = getValue(['przedmiot_id', 'subjectid', 'subjectId'])
      return {
        przedmiot_id: subjectId ? Number(subjectId) : null,
        typ: getValue(['typ', 'type']),
        czas: getValue(['czas', 'time']),
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
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!response.ok) {
          const error = await response.json().catch(() => ({}))
          return { index, ok: false, message: error.error || error.message || 'Błąd zapisu' }
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

  const handleCsvFileChange = async (event) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }
    const text = await file.text()
    const rows = parseCsv(text)
    if (!rows.length) {
      setFormStatus({ type: 'error', message: 'Nie udało się odczytać pliku CSV.' })
      event.target.value = ''
      return
    }
    await importCsvRecords(rows, importTarget)
    event.target.value = ''
  }

  const triggerCsvImport = (target) => {
    setImportTarget(target)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
      fileInputRef.current.click()
    }
  }

  const resetForm = () => {
    setSelectedStudent(null)
    setFormData({ indexNumber: '', firstName: '', lastName: '', login: '', password: '' })
    setSelectedLecturer(null)
    setLecturerFormData({ userId: '', firstName: '', lastName: '', title: '' })
    setSelectedSubject(null)
    setSubjectFormData({ name: '', type: '', hours: '', lecturerId: '' })
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

  const Header = () => (
    <div className="student-menu-header">
      <div className="student-menu-user">
        <div>
          <strong>Menu administratora</strong>
          <div className="student-menu-user-info">Jesteś zalogowany jako {user?.login || 'administrator'}</div>
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
      const response = await fetch(`/api/student/${id}`, { method: 'DELETE' })
      if (!response.ok) {
        throw new Error('Nie udało się usunąć studenta')
      }
      setStudents((prev) => prev.filter((student) => student.id !== id))
    } catch (error) {
      console.error(error)
    }
  }

  const handleDeleteLecturer = async (id) => {
    try {
      const response = await fetch(`/api/wykladowca/${id}`, { method: 'DELETE' })
      if (!response.ok) {
        throw new Error('Nie udało się usunąć wykładowcy')
      }
      setLecturers((prev) => prev.filter((lecturer) => lecturer.id !== id))
    } catch (error) {
      console.error(error)
    }
  }

  const handleEditLecturer = (lecturer) => {
    setSelectedLecturer(lecturer)
    setLecturerFormData({
      userId: lecturer.userId?.toString() || '',
      firstName: lecturer.firstName,
      lastName: lecturer.lastName,
      title: lecturer.title,
    })
    setActiveView('editLecturer')
  }

  const handleDeleteSubject = async (id) => {
    try {
      const response = await fetch(`/api/przedmiot/${id}`, { method: 'DELETE' })
      if (!response.ok) {
        throw new Error('Nie udało się usunąć przedmiotu')
      }
      setSubjects((prev) => prev.filter((subject) => subject.id !== id))
    } catch (error) {
      console.error(error)
    }
  }

  const handleEditSubject = (subject) => {
    setSelectedSubject(subject)
    setSubjectFormData({
      name: subject.name,
      type: subject.type,
      hours: subject.hours,
      lecturerId: subject.lecturerId?.toString() || '',
    })
    setActiveView('editSubject')
  }

  const handleDeleteClass = async (id) => {
    try {
      const response = await fetch(`/api/zajecia/${id}`, { method: 'DELETE' })
      if (!response.ok) {
        throw new Error('Nie udało się usunąć zajęć')
      }
      setClasses((prev) => prev.filter((classItem) => classItem.id !== id))
    } catch (error) {
      console.error(error)
    }
  }

  const handleEditClass = (classItem) => {
    setSelectedClass(classItem)
    setClassFormData({
      subjectId: classItem.subjectId?.toString() || '',
      type: classItem.type,
      time: classItem.time,
    })
    setActiveView('editClass')
  }

  const handleEditStudent = (student) => {
    setSelectedStudent(student)
    setFormData({
      indexNumber: student.indexNumber,
      firstName: student.firstName || '',
      lastName: student.lastName || '',
      login: student.login || '',
      password: '',
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

  const handleSubmitStudent = async (event) => {
    event.preventDefault()
    setSaving(true)
    setFormStatus({ type: '', message: '' })
    const payload = {
      nr_albumu: formData.indexNumber !== '' ? Number(formData.indexNumber) : null,
      imie: formData.firstName || null,
      nazwisko: formData.lastName || null,
      login: formData.login || null,
      haslo: formData.password || null,
    }

    try {
      const url = selectedStudent ? `/api/student/${selectedStudent.id}` : '/api/student'
      const method = selectedStudent ? 'PUT' : 'POST'
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!response.ok) {
        const errorMessage = await parseApiError(response, 'Błąd zapisu studenta')
        throw new Error(errorMessage)
      }
      setFormStatus({
        type: 'success',
        message: selectedStudent ? 'Zaktualizowano dane studenta' : 'Dodano nowego studenta',
      })
      setSelectedStudent(null)
      setActiveView('students')
      resetForm()
      await fetchStudents()
    } catch (error) {
      console.error(error)
      setFormStatus({ type: 'error', message: error.message || 'Błąd zapisu studenta' })
    } finally {
      setSaving(false)
    }
  }

  // View component renders list and actions
  const StudentListView = () => (
    <>
      <StudentList
        style={pageStyle}
        user={user}
        students={students}
        onAdd={() => { resetForm(); setActiveView('addStudent') }}
        onEdit={(s) => handleEditStudent(s)}
        onDelete={(id) => handleDeleteStudent(id)}
        onBack={handleBack}
        onImportCsv={() => triggerCsvImport('student')}
        status={formStatus}
      />
      <input ref={fileInputRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={handleCsvFileChange} />
    </>
  )

  const StudentFormView = ({ title }) => (
    activeView === 'addStudent' ? (
      <AddStudent
        style={pageStyle}
        title={title}
        formData={formData}
        onChange={(fd) => setFormData(fd)}
        onCancel={() => setActiveView('students')}
        onSave={async (payload) => {
          setSaving(true)
          setFormStatus({ type: '', message: '' })
          try {
            let userId = null
            if (payload.login || payload.password) {
              const userResponse = await fetch('/api/uzytkownicy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rola: 'student', login: payload.login || null, haslo: payload.password || null }),
              })
              const userResult = await userResponse.json()
              if (!userResponse.ok) {
                throw new Error(userResult.error || userResult.message || 'Błąd tworzenia konta użytkownika')
              }
              userId = userResult.id
            }

            const studentPayload = {
              nr_albumu: payload.indexNumber !== '' ? Number(payload.indexNumber) : null,
              uzytkownicy_id: userId,
              imie: payload.imie || null,
              nazwisko: payload.nazwisko || null,
            }
            const response = await fetch('/api/student', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(studentPayload),
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
        onChange={(fd) => setFormData(fd)}
        student={selectedStudent}
        onCancel={() => setActiveView('students')}
        onSave={async (payload) => {
          setSaving(true)
          setFormStatus({ type: '', message: '' })
          try {
            let userId = selectedStudent?.userId || null
            if (userId) {
              const updatePayload = {
                rola: 'student',
                login: payload.login || selectedStudent.login || null,
              }
              if (payload.password) {
                updatePayload.haslo = payload.password
              }
              const userResponse = await fetch(`/api/uzytkownicy/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatePayload),
              })
              const userResult = await userResponse.json()
              if (!userResponse.ok) {
                throw new Error(userResult.error || userResult.message || 'Błąd aktualizacji konta użytkownika')
              }
            } else if (payload.login || payload.password) {
              const createResponse = await fetch('/api/uzytkownicy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rola: 'student', login: payload.login || null, haslo: payload.password || null }),
              })
              const createResult = await createResponse.json()
              if (!createResponse.ok) {
                throw new Error(createResult.error || createResult.message || 'Błąd tworzenia konta użytkownika')
              }
              userId = createResult.id
            }

            const studentPayload = {
              nr_albumu: payload.indexNumber !== '' ? Number(payload.indexNumber) : null,
              uzytkownicy_id: userId,
              imie: payload.imie || null,
              nazwisko: payload.nazwisko || null,
            }
            const response = await fetch(`/api/student/${selectedStudent.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(studentPayload),
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
        body: JSON.stringify(payload),
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

  const LecturerListView = () => (
    <>
      <LecturerList
        style={pageStyle}
        user={user}
        lecturers={lecturers}
        onAdd={() => { resetForm(); setActiveView('addLecturer') }}
        onEdit={(lecturer) => handleEditLecturer(lecturer)}
        onDelete={(id) => handleDeleteLecturer(id)}
        onBack={handleBack}
        onImportCsv={() => triggerCsvImport('lecturer')}
        status={formStatus}
      />
      <input ref={fileInputRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={handleCsvFileChange} />
    </>
  )

  const LecturerFormView = ({ title }) => (
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

  const SubjectListView = () => (
    <>
      <SubjectList
        style={pageStyle}
        user={user}
        subjects={subjects}
        onAdd={() => { resetForm(); setActiveView('addSubject') }}
        onEdit={(subject) => handleEditSubject(subject)}
        onDelete={(id) => handleDeleteSubject(id)}
        onBack={handleBack}
        onImportCsv={() => triggerCsvImport('subject')}
        status={formStatus}
      />
      <input ref={fileInputRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={handleCsvFileChange} />
    </>
  )

  const SubjectFormView = ({ title }) => (
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

  const ClassListView = () => (
    <>
      <ZajeciaList
        style={pageStyle}
        user={user}
        classes={classes}
        onAdd={() => { resetForm(); setActiveView('addClass') }}
        onEdit={(classItem) => handleEditClass(classItem)}
        onDelete={(id) => handleDeleteClass(id)}
        onBack={handleBack}
        onImportCsv={() => triggerCsvImport('class')}
        status={formStatus}
      />
      <input ref={fileInputRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={handleCsvFileChange} />
    </>
  )

  const ClassFormView = ({ title }) => (
    activeView === 'addClass' ? (
      <AddZajecia
        style={pageStyle}
        title={title}
        formData={classFormData}
        status={formStatus}
        subjects={subjects}
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
        formData={classFormData}
        status={formStatus}
        subjects={subjects}
        onChange={handleClassFormChange}
        classData={selectedClass}
        onCancel={() => setActiveView('classes')}
        onSave={async (payload) => {
          await handleSubmitClass(payload)
        }}
      />
    )
  )

  if (activeView === 'students') {
    return <StudentListView />
  }

  if (activeView === 'addStudent') {
    return <StudentFormView title="Dodaj studenta" />
  }

  if (activeView === 'editStudent') {
    return <StudentFormView title="Edytuj studenta" />
  }

  if (activeView === 'lecturers') {
    return <LecturerListView />
  }

  if (activeView === 'addLecturer') {
    return <LecturerFormView title="Dodaj wykładowcę" />
  }

  if (activeView === 'editLecturer') {
    return <LecturerFormView title="Edytuj wykładowcę" />
  }

  if (activeView === 'subjects') {
    return <SubjectListView />
  }

  if (activeView === 'addSubject') {
    return <SubjectFormView title="Dodaj przedmiot" />
  }

  if (activeView === 'editSubject') {
    return <SubjectFormView title="Edytuj przedmiot" />
  }

  if (activeView === 'classes') {
    return <ClassListView />
  }

  if (activeView === 'addClass') {
    return <ClassFormView title="Dodaj zajęcia" />
  }

  if (activeView === 'editClass') {
    return <ClassFormView title="Edytuj zajęcia" />
  }

  return (
    <div className="student-menu-page" style={pageStyle}>
      <Header />
      <div className="student-menu-panel">
        <button type="button" onClick={() => setActiveView('students')}>
          Zarządzaj studentami
        </button>
        <button type="button" onClick={() => setActiveView('lecturers')}>
          Wyświetl listę wykładowców
        </button>
        <button type="button" onClick={() => setActiveView('subjects')}>
          Wyświetl listę przedmiotów
        </button>
        <button type="button" onClick={() => setActiveView('classes')}>
          Wyświetl listę zajęć
        </button>
        <button type="button" onClick={handleLogout}>
          Wyloguj się
        </button>
      </div>
    </div>
  )
}

export default AdminMenu
