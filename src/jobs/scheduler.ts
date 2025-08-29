import cron from 'node-cron';
import app from '../app'; // se preferir, injete o service diretamente

// Exemplo: roda a cada minuto (ajuste p/ diária no mundo real: '0 8 * * *')
cron.schedule('* * * * *', async () => {
  // você pode expor o service num singleton ou criar endpoint interno
  fetch('http://localhost:3000/billing/run', { method: 'POST' }).catch(()=>{});
});
