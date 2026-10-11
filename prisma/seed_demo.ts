import { prisma } from '../src/lib/db';

async function seedCurrentAppointments() {
  const barbers = await prisma.barber.findMany();
  const clients = await prisma.client.findMany();
  const services = await prisma.service.findMany();

  if (barbers.length === 0 || services.length === 0 || clients.length === 0) {
    console.log('Dati base mancanti');
    return;
  }

  const b1 = barbers[0].id;
  const b2 = barbers.length > 1 ? barbers[1].id : barbers[0].id;
  const c1 = clients[0].id;
  const c2 = clients.length > 1 ? clients[1].id : clients[0].id;
  const c3 = clients.length > 2 ? clients[2].id : clients[0].id;
  const s1 = services[0].id;
  const s2 = services.length > 1 ? services[1].id : services[0].id;
  const s3 = services.length > 2 ? services[2].id : services[0].id;

  const today = new Date();

  const sampleAppointments = [
    {
      id: 'appt_demo_1',
      barberId: b1,
      clientId: c1,
      serviceId: s1,
      offsetDays: 0,
      startTime: '09:30',
      endTime: '10:05',
      status: 'CONFIRMED',
      channel: 'WEB',
      notes: 'Sfumatura alta a forbice',
      pricePaid: 28,
    },
    {
      id: 'appt_demo_2',
      barberId: b2,
      clientId: c2,
      serviceId: s3,
      offsetDays: 0,
      startTime: '10:30',
      endTime: '11:30',
      status: 'IN_PROGRESS',
      channel: 'PHONE',
      notes: 'Trattamento panno caldo e rasatura',
      pricePaid: 44,
    },
    {
      id: 'appt_demo_3',
      barberId: b1,
      clientId: c3,
      serviceId: s2,
      offsetDays: 0,
      startTime: '11:45',
      endTime: '12:10',
      status: 'CONFIRMED',
      channel: 'WHATSAPP',
      notes: 'Olio barba e balsamo',
      pricePaid: 20,
    },
    {
      id: 'appt_demo_4',
      barberId: b2,
      clientId: c1,
      serviceId: s1,
      offsetDays: 0,
      startTime: '15:00',
      endTime: '15:35',
      status: 'PENDING',
      channel: 'WEB',
      notes: 'Da confermare con cliente',
      pricePaid: 28,
    },
    {
      id: 'appt_demo_5',
      barberId: b1,
      clientId: c2,
      serviceId: s1,
      offsetDays: 1,
      startTime: '10:00',
      endTime: '10:35',
      status: 'CONFIRMED',
      channel: 'WEB',
      notes: 'Taglio classico',
      pricePaid: 28,
    },
    {
      id: 'appt_demo_6',
      barberId: b2,
      clientId: c3,
      serviceId: s3,
      offsetDays: 1,
      startTime: '14:30',
      endTime: '15:30',
      status: 'CONFIRMED',
      channel: 'PHONE',
      notes: 'Taglio + Barba VIP',
      pricePaid: 44,
    },
    {
      id: 'appt_demo_7',
      barberId: b1,
      clientId: c1,
      serviceId: s2,
      offsetDays: 2,
      startTime: '11:00',
      endTime: '11:25',
      status: 'CONFIRMED',
      channel: 'WALK_IN',
      notes: 'Barba express',
      pricePaid: 20,
    },
  ];

  for (const item of sampleAppointments) {
    const targetDate = new Date(today);
    targetDate.setDate(targetDate.getDate() + item.offsetDays);
    targetDate.setHours(0, 0, 0, 0);

    await prisma.appointment.upsert({
      where: { id: item.id },
      update: {
        date: targetDate,
        startTime: item.startTime,
        endTime: item.endTime,
        status: item.status,
        channel: item.channel,
        notes: item.notes,
        pricePaid: item.pricePaid,
      },
      create: {
        id: item.id,
        barberId: item.barberId,
        clientId: item.clientId,
        serviceId: item.serviceId,
        date: targetDate,
        startTime: item.startTime,
        endTime: item.endTime,
        status: item.status,
        channel: item.channel,
        notes: item.notes,
        pricePaid: item.pricePaid,
      },
    });
  }

  const total = await prisma.appointment.count();
  console.log(`Demo appointments seeded! Total: ${total}`);
}

seedCurrentAppointments()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
