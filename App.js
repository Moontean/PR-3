import React, { useState, useEffect } from 'react';
import TaskList from './components/TaskList';
import TaskForm from './components/TaskForm';
import { fetchTasks, createTask, updateTask, deleteTask, sendEmail, checkEmailsIMAP, checkEmailsPOP3 } from '../services/api';
import './App.css';

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [editId, setEditId] = useState(null);
  const [emailStatus, setEmailStatus] = useState('');
  const [imapEmails, setImapEmails] = useState([]);
  const [pop3Emails, setPop3Emails] = useState([]);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const response = await fetchTasks();
      setTasks(response.data);
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      if (editId) {
        await updateTask(editId, { title, description });
        setEditId(null);
      } else {
        await createTask({ title, description });
      }
      setTitle('');
      setDescription('');
      loadTasks();
    } catch (error) {
      console.error('Error submitting task:', error);
    }
  };

  const handleEdit = (task) => {
    setEditId(task.id);
    setTitle(task.title);
    setDescription(task.description);
  };

  const handleDelete = async (id) => {
    try {
      await deleteTask(id);
      loadTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleSendEmail = async (id) => {
    try {
      const response = await sendEmail(id);
      setEmailStatus(response.data.message);
      setTimeout(() => setEmailStatus(''), 5000); // Скрыть сообщение через 5 секунд
    } catch (error) {
      setEmailStatus(`Error sending email: ${error.message}`);
      setTimeout(() => setEmailStatus(''), 5000);
    }
  };

  const handleCheckEmailsIMAP = async () => {
    try {
      const response = await checkEmailsIMAP();
      setImapEmails(response.data.emails);
    } catch (error) {
      console.error('Error checking IMAP emails:', error);
    }
  };

  const handleCheckEmailsPOP3 = async () => {
    try {
      const response = await checkEmailsPOP3();
      setPop3Emails(response.data.emails);
    } catch (error) {
      console.error('Error checking POP3 emails:', error);
    }
  };

  return (
    <div className="App">
      <h1>ToDo List</h1>
      <TaskForm
        title={title}
        setTitle={setTitle}
        description={description}
        setDescription={setDescription}
        onSubmit={handleSubmit}
        editId={editId}
      />
      <TaskList
        tasks={tasks}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onSendEmail={handleSendEmail}
      />
      {emailStatus && <p style={{ color: emailStatus.includes('Error') ? 'red' : 'green' }}>{emailStatus}</p>}
      <button onClick={handleCheckEmailsIMAP}>Check IMAP Emails</button>
      <button onClick={handleCheckEmailsPOP3}>Check POP3 Emails</button>
      <div>
        <h3>IMAP Emails:</h3>
        <ul>
          {imapEmails.map((email, index) => (
            <li key={index}>{JSON.stringify(email)}</li>
          ))}
        </ul>
      </div>
      <div>
        <h3>POP3 Emails:</h3>
        <ul>
          {pop3Emails.map((email, index) => (
            <li key={index}>{JSON.stringify(email)}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;