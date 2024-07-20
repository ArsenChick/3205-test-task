import express from 'express';
import escapeRegExp from 'lodash.escaperegexp';
import { DB, ISearchRequest, SearchItem } from '@org/db-and-api-interfaces';

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

const TIMEOUT_VALUE = 5000;
const NUMBER_REGEX = /^\d*$/;

const app = express();
app.use(express.json());

const sessionIdSet = new Set<string>();
const timeoutDict = new Map<string, NodeJS.Timeout>();

// CORS setup
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', 'http://localhost:4200');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, User-Id'
  );
  next();
});

app.get('/', (req, res) => {
  res.send({ message: 'Hello API' });
});

const stopRequest = (userSessionId: string) => {
  clearTimeout(timeoutDict.get(userSessionId));
  timeoutDict.delete(userSessionId);
  sessionIdSet.delete(userSessionId);
}

app.post('/search', (req, res) => {
  const userIdHeader = req.headers['user-id'];
  if (userIdHeader === undefined) {
    return res.status(401).send('Please, specify the User-Id header.');
  }

  const userSessionId = userIdHeader.toString();
  console.log(`Request from ${userSessionId}`);
  if (sessionIdSet.has(userSessionId)) {
    console.log('duplicate request from the same client w/out closing the connection');
    stopRequest(userSessionId);
  }

  const searchBody = (req.body as ISearchRequest);
  // Ensure the presence of the email field
  if (searchBody.email !== undefined && searchBody.email !== '') {
    // Search is case-insensitive
    const searchTerm = escapeRegExp(searchBody.email);
    const filterCond1 = (item: SearchItem): boolean =>
      new RegExp(searchTerm, 'i').test(item.email);
    let finalFilterCond = filterCond1;

    // Number is optional
    if (searchBody.number !== undefined) {
      // However, if it's present, ensure it consists of digits only
      if (NUMBER_REGEX.test(searchBody.number)) {
        const searchNumber = searchBody.number; 
        const filterCond2 = (item: SearchItem): boolean =>
          new RegExp(searchNumber).test(item.number ?? '');
        finalFilterCond = (item: SearchItem) =>
          filterCond1(item) && filterCond2(item); 
      } else {
        return res.status(422).send('Number field must contain only number chars.');
      }
    }

    sessionIdSet.add(userSessionId);
    const timeout = setTimeout(() => {
      res.json(DB.filter(finalFilterCond));
      stopRequest(userSessionId);
    }, TIMEOUT_VALUE);
    timeoutDict.set(userSessionId, timeout);

    // If request is cancelled before the timeout, stop it
    req.socket.on('close', () => stopRequest(userSessionId));
  } else {
    // If email is not present
    return res.status(400).send('Email field is required.');
  }
});

app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
});
