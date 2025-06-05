import React from 'react';

const TaskItem = ({ task, onEdit, onDelete, onSendEmail }) => {
  return (
    <tr>
      <td>{task.id}</td>
      <td>{task.title}</td>
      <td>{task.description}</td>
      <td>
        <button onClick={() => onEdit(task)}>Edit</button>
        <button onClick={() => onDelete(task.id)}>Delete</button>
        <button onClick={() => onSendEmail(task.id)}>Send Email</button>
      </td>
    </tr>
  );
};

export default TaskItem;