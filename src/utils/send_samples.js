import https from 'https';

const samples = [
  {
    event: 'order.created',
    companyId: 'averqon-demo',
    data: {
      orderNumber: 'ORD-1001',
      customerName: 'Muneeswaran (Test)',
      customerPhone: '9876543210',
      productName: 'Rocket Crackers, Flower Pots',
      totalAmount: 850
    }
  },
  {
    event: 'stock.adjusted',
    companyId: 'averqon-demo',
    data: {
      productName: 'Rocket Crackers',
      newStock: 5,
      type: 'remove',
      qty: 10,
      reason: 'Low Stock Test'
    }
  },
  {
    event: 'dispatch.created',
    companyId: 'averqon-demo',
    data: {
      orderRef: 'ORD-1001',
      customerName: 'Muneeswaran (Test)',
      courierName: 'DTDC',
      trackingNumber: 'DT123456789',
      trackingUrl: 'https://www.dtdc.in/tracking/DT123456789'
    }
  }
];

const url = 'https://n8n-m45f.onrender.com/webhook-test/averqon-events';

function send(payload) {
  return new Promise((resolve) => {
    const data = JSON.stringify({
      ...payload,
      timestamp: new Date().toISOString()
    });

    const req = https.request(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    }, (res) => {
      console.log(`Sent ${payload.event} - Status: ${res.statusCode}`);
      resolve();
    });

    req.on('error', (e) => {
      console.error(`Error sending ${payload.event}: ${e.message}`);
      resolve();
    });

    req.write(data);
    req.end();
  });
}

const run = async () => {
  for (const sample of samples) {
    await send(sample);
  }
};

run();
