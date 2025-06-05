import React, { useState, useEffect } from 'react';
import { checkInbox } from '../../services/api';

const Inbox = () => {
  const [emails, setEmails] = useState([]);

  useEffect(() => {
    const fetchInbox = async () => {
      try {
        const response = await checkInbox();
        if (response.data.success) {
          setEmails(response.data.emails);
        }
      } catch (error) {
        console.error('Error fetching inbox:', error);
      }
    };
    fetchInbox();
  }, []);

  return (
    <div>
      <h2>Inbox</h2>
      <ul>
        {emails.map((email, index) => (
          <li key={index}>
            From: {email.from} | Subject: {email.subject} | Date: {email.date}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Inbox;