import { sendNotification } from './index';
import { emailTemplates, smsTemplates } from './templates';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Event } from '../../types/events';
import { NotificationPreferences } from './types';

async function getUserNotificationPreferences(userId: string): Promise<NotificationPreferences | null> {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) return null;
    return userDoc.data().notificationPreferences || null;
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    return null;
  }
}

async function getUnreadNotifications(userId: string, teamIds: string[]) {
  const notifications = [];
  
  // Process teams in batches of 10
  for (let i = 0; i < teamIds.length; i += 10) {
    const teamBatch = teamIds.slice(i, i + 10);
    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('teamId', 'in', teamBatch),
      where('readBy', 'array-contains', userId),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    notifications.push(...snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })));
  }
  
  return notifications;
}

export async function sendSignupConfirmation(
  userId: string,
  userEmail: string,
  userName: string
) {
  try {
    const data = { userName };
    
    await sendNotification('email', {
      to: userEmail,
      ...emailTemplates.signupConfirmation(data)
    });
  } catch (error) {
    console.error('Error sending signup confirmation:', error);
  }
}

export async function sendProgressReportNotification(
  userId: string,
  userEmail: string,
  userName: string,
  reportDate: Date
) {
  try {
    const prefs = await getUserNotificationPreferences(userId);
    if (!prefs?.types.progressReports) return;

    const data = {
      playerName: userName,
      reportDate: reportDate.toLocaleDateString()
    };

    if (prefs.email) {
      await sendNotification('email', {
        to: userEmail,
        ...emailTemplates.progressReport(data)
      });
    }

    if (prefs.sms) {
      await sendNotification('sms', {
        to: userId,
        text: smsTemplates.progressReport()
      });
    }
  } catch (error) {
    console.error('Error sending progress report notification:', error);
  }
}

export async function sendAwardNotification(
  userId: string,
  userEmail: string,
  userName: string,
  awardName: string,
  teamName: string
) {
  try {
    const prefs = await getUserNotificationPreferences(userId);
    if (!prefs) return;

    const data = {
      playerName: userName,
      awardName,
      teamName
    };

    if (prefs.email) {
      await sendNotification('email', {
        to: userEmail,
        ...emailTemplates.awardReceived(data)
      });
    }

    if (prefs.sms) {
      await sendNotification('sms', {
        to: userId,
        text: smsTemplates.awardReceived(data)
      });
    }
  } catch (error) {
    console.error('Error sending award notification:', error);
  }
}

export async function sendHomeworkAssigned(
  userId: string,
  userEmail: string,
  userName: string,
  homeworkTitle: string,
  dueDate: Date
) {
  try {
    const prefs = await getUserNotificationPreferences(userId);
    if (!prefs?.types.homeworkReminders) return;

    const data = {
      playerName: userName,
      homeworkTitle,
      dueDate: dueDate.toLocaleDateString()
    };

    if (prefs.email) {
      await sendNotification('email', {
        to: userEmail,
        ...emailTemplates.homeworkReminder(data)
      });
    }

    if (prefs.sms) {
      await sendNotification('sms', {
        to: userId,
        text: smsTemplates.homeworkReminder(data)
      });
    }
  } catch (error) {
    console.error('Error sending homework notification:', error);
  }
}

export async function sendClinicRegistrationConfirmation(
  userId: string,
  userEmail: string,
  userName: string,
  clinicName: string,
  clinicDate: Date,
  location: string
) {
  try {
    const data = {
      userName,
      clinicName,
      date: clinicDate.toLocaleDateString(),
      location
    };

    await sendNotification('email', {
      to: userEmail,
      ...emailTemplates.clinicRegistration(data)
    });

    const prefs = await getUserNotificationPreferences(userId);
    if (prefs?.sms) {
      await sendNotification('sms', {
        to: userId,
        text: smsTemplates.clinicRegistration(data)
      });
    }
  } catch (error) {
    console.error('Error sending clinic registration confirmation:', error);
  }
}