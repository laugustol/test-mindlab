import React, { useState, useEffect } from 'react';
import { Container, Button, Form, InputGroup, FormControl, Alert } from 'react-bootstrap';

function App() {
  const [message, setMessage] = useState('');
  const [recordQuerys, setRecordQuerys] = useState([]);
  const [threadId, setThreadId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    startThread()
  }, []);

  const startThread = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${process.env.REACT_APP_URL_BASE}/start-thread/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      setThreadId(data.thread_id);
      setLoading(false)
    } catch (err) {
      setError('Error starting thread.');
      console.error(err);
      setLoading(false)
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    try {
      setLoading(true)
      const res = await fetch(`${process.env.REACT_APP_URL_BASE}/receive-query/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body:JSON.stringify({"thread_id":threadId,"message":message})
      });
      const data = await res.json();
      recordQuerys.push([message, data.response])
      
      setRecordQuerys(recordQuerys.reverse())
      setMessage('');
      setLoading(false)
    } catch (err) {
      setLoading(false)
      setError('Error send query.');
      console.error(err);
    }
  };

  return (
    <Container className="mt-5">
      <h1 className="mb-4">Chat with Assistant</h1>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form onSubmit={sendMessage}>
        <InputGroup className="mb-3">
          <FormControl
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <Button variant={loading ? "info" : "success"} type="submit">
            {loading ? 'Cargando':'Enviar'}
          </Button>
        </InputGroup>
      </Form>
      {recordQuerys && recordQuerys.map((i) => {
        return <Alert variant="info">
                <strong strong>Consulta:</strong> {i[0]}
                <br/>
                <strong>Respuesta:</strong> {i[1]}
              </Alert>
      })}
    </Container>
  );
}

export default App;
