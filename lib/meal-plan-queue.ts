import { Queue } from "bullmq";
import { formatISO } from "date-fns";

const mealPlanQueueConnection = {
  host: process.env.REDIS_SERVER_HOST || "127.0.0.1",
  port: Number(process.env.REDIS_SERVER_PORT || "6379"),
};

export function getMealPlanQueue() {
  return new Queue("generateMealPlan", {
    connection: mealPlanQueueConnection,
  });
}

export async function scheduleMealPlanDeliveries(
  userId: string,
  deliveryDates: Date[],
) {
  const queue = getMealPlanQueue();

  try {
    for (const targetDate of deliveryDates) {
      const date = formatISO(targetDate, { representation: "date" });
      const [year, month, day] = date.split("-").map(Number);
      const deliveryAt = new Date(Date.UTC(year, month - 1, day, 10, 30));
      deliveryAt.setUTCDate(deliveryAt.getUTCDate() - 1);

      await queue.add(
        "deliverMealPlanDay",
        { userId, date },
        {
          delay: Math.max(deliveryAt.getTime() - Date.now(), 0),
          jobId: `daily-plan-${userId}-${date}`,
          removeOnComplete: true,
        },
      );
    }
  } finally {
    await queue.close();
  }
}

function notificationTime(date: Date, time: string) {
  const targetDate = formatISO(date, { representation: "date" });
  return new Date(`${targetDate}T${time}+05:30`);
}

export async function scheduleMealReminders(userId: string, deliveryDates: Date[]) {
  const queue = getMealPlanQueue();
  const reminders = [
    { meal: "Breakfast", time: "07:30:00" },
    { meal: "Lunch", time: "12:30:00" },
    { meal: "Dinner", time: "18:30:00" },
  ];

  try {
    for (const targetDate of deliveryDates) {
      const date = formatISO(targetDate, { representation: "date" });
      for (const reminder of reminders) {
        const sendAt = notificationTime(targetDate, reminder.time);
        if (sendAt <= new Date()) continue;
        await queue.add(
          "mealReminder",
          { userId, date, meal: reminder.meal },
          {
            delay: sendAt.getTime() - Date.now(),
            jobId: `push-meal-${userId}-${date}-${reminder.meal.toLowerCase()}`,
            removeOnComplete: true,
          },
        );
      }
    }
  } finally {
    await queue.close();
  }
}

export async function scheduleMembershipExpiryNotifications(
  userId: string,
  assignmentId: string,
  endDate: Date | null,
) {
  if (!endDate) return;
  const queue = getMealPlanQueue();
  const reminders = [
    { key: "three-days", daysBefore: 3, label: "3 days" },
    { key: "today", daysBefore: 0, label: "today" },
  ];

  try {
    for (const reminder of reminders) {
      const sendAt = notificationTime(endDate, "10:00:00");
      sendAt.setDate(sendAt.getDate() - reminder.daysBefore);
      if (sendAt <= new Date()) continue;
      await queue.add(
        "membershipExpiryReminder",
        { userId, assignmentId, label: reminder.label },
        {
          delay: sendAt.getTime() - Date.now(),
          jobId: `push-expiry-${assignmentId}-${reminder.key}`,
          removeOnComplete: true,
        },
      );
    }
  } finally {
    await queue.close();
  }
}

export async function scheduleNotificationCampaign(campaignId: string, scheduledAt: Date) {
  const queue = getMealPlanQueue();
  try {
    await queue.add(
      "sendNotificationCampaign",
      { campaignId },
      {
        delay: Math.max(scheduledAt.getTime() - Date.now(), 0),
        jobId: `push-campaign-${campaignId}`,
        removeOnComplete: true,
      },
    );
  } finally {
    await queue.close();
  }
}
