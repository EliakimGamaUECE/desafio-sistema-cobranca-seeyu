import cron from 'node-cron';
import app from '../app'; 

cron.schedule('* * * * *', async () => {
  fetch('http://localhost:3000/billing/run', { method: 'POST' }).catch(()=>{});
});
