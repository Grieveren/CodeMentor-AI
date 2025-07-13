import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config.js';
import { executionService } from './services/execution.js';
import { RunRequest } from './types.js';

const app = express();

app.use(cors({ origin: config.app.corsOrigin }));
app.use(helmet());
app.use(express.json());

app.post('/run', async (req, res) => {
  const { challengeId, code, language, stdin } = req.body as RunRequest;

  try {
    if (!challengeId || !code || !language) {
      return res.status(400).json({ error: 'challengeId, code, and language fields are required.' });
    }

    const submissionStatus = await executionService.executeCode(challengeId, code, language, stdin);

    return res.status(200).json(submissionStatus);
  } catch (error) {
    console.error('Error handling /run request:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = config.app.port;
app.listen(PORT, () => {
  console.log(`Code Runner service listening on port ${PORT}`);
});

export default app;
