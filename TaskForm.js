import React from 'react';

const TaskForm = ({ title, setTitle, description, setDescription, onSubmit, editId }) => {
  return (
    <div>
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <button onClick={onSubmit}>{editId ? 'Update' : 'Add'} Task</button>
    </div>
  );
};

export default TaskForm;