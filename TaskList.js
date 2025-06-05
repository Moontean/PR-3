import React from 'react';
import { sendTaskEmail } from '../../services/api'; // Импорт функции

const TaskList = ({ tasks, onEdit, onDelete }) => {
  const [recipientEmail, setRecipientEmail] = React.useState('');

  const handleSendEmail = async (taskId) => {
    try {
      const response = await sendTaskEmail(taskId, recipientEmail);
      alert(response.data.message);
      setRecipientEmail(''); // Сброс поля после отправки
    } catch (error) {
      alert('Failed to send email');
    }
  };

  return (
    <table>
      <thead>
        <tr>
          <th>Title</th>
          <th>Description</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {tasks.map((task) => (
          <tr key={task.id}>
            <td>{task.title}</td>
            <td>{task.description}</td>
            <td>
              <button onClick={() => onEdit(task)}>Edit</button>
              <button onClick={() => onDelete(task.id)}>Delete</button>
              <input
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="Recipient email"
              />
              <button onClick={() => handleSendEmail(task.id)}>Send by Email</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default TaskList;