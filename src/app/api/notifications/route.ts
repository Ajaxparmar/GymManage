import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { NotificationType, NotificationStatus } from '@prisma/client';

interface CreateNotificationRequest {
  studentId: string;
  type: NotificationType;
  message: string;
}

/* POST - Log Notification */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CreateNotificationRequest;
    const { studentId, type, message } = body;

    if (!studentId || !type || !message) {
      return NextResponse.json(
        { error: 'studentId, type, and message are required' },
        { status: 400 }
      );
    }

    const notification = await prisma.notification.create({
      data: {
        studentId,
        type,
        message,
        status: 'PENDING',
      },
      include: {
        student: { select: { id: true, name: true, mobile: true } },
      },
    });

    return NextResponse.json(
      { success: true, message: 'Notification queued', data: notification },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create notification error:', error);
    return NextResponse.json(
      { error: 'Failed to create notification', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/* GET - List Notifications */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get('studentId');
    const status    = searchParams.get('status') as NotificationStatus | null;
    const type      = searchParams.get('type') as NotificationType | null;
    const gymId     = searchParams.get('gymId');

    const notifications = await prisma.notification.findMany({
      where: {
        ...(studentId && { studentId }),
        ...(status    && { status }),
        ...(type      && { type }),
        ...(gymId     && { student: { gymId } }),
      },
      include: {
        student: { select: { id: true, name: true, mobile: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: notifications });
  } catch (error) {
    console.error('Fetch notifications error:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

/* PUT - Update Notification Status (mark sent/failed) */
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { notificationId, status, error: errorMsg } = body;

    if (!notificationId || !status) {
      return NextResponse.json(
        { error: 'notificationId and status are required' },
        { status: 400 }
      );
    }

    const updated = await prisma.notification.update({
      where: { id: notificationId },
      data: {
        status,
        ...(status === 'SENT'   && { sentAt: new Date() }),
        ...(status === 'FAILED' && { error: errorMsg ?? 'Unknown error' }),
      },
    });

    return NextResponse.json({ success: true, message: 'Notification updated', data: updated });
  } catch (error) {
    console.error('Update notification error:', error);
    return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 });
  }
}

/* DELETE - Remove Notification */
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const notificationId = searchParams.get('id');

    if (!notificationId) {
      return NextResponse.json({ error: 'Notification ID required' }, { status: 400 });
    }

    await prisma.notification.delete({ where: { id: notificationId } });

    return NextResponse.json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    console.error('Delete notification error:', error);
    return NextResponse.json({ error: 'Failed to delete notification' }, { status: 500 });
  }
}
