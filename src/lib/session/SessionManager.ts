import { prisma } from '../database/prisma';
import { logger } from '../logger/WinstonLogger';

export class SessionManager {
  static async createSession(goal: string) {
    try {
      logger.info(`Creating database session for goal: "${goal}"`);
      return await prisma.session.create({
        data: {
          goal,
          status: 'STARTING',
        }
      });
    } catch (error) {
      logger.error('Failed to create database session', error);
      throw error;
    }
  }

  static async saveStep(params: {
    sessionId: string;
    action: string;
    status: 'SUCCESS' | 'FAILED' | 'RETRYING';
    duration: number;
    retries: number;
    screenshot?: string;
  }) {
    try {
      logger.info(`Saving step into DB: "${params.action}" [Status: ${params.status}]`);
      return await prisma.step.create({
        data: {
          sessionId: params.sessionId,
          action: params.action,
          status: params.status,
          duration: params.duration,
          retries: params.retries,
          screenshot: params.screenshot || null
        }
      });
    } catch (error) {
      logger.error('Failed to save database step', error);
      throw error;
    }
  }

  static async updateSessionStatus(sessionId: string, status: string) {
    try {
      return await prisma.session.update({
        where: { id: sessionId },
        data: { status }
      });
    } catch (error) {
      logger.error(`Failed to update session status for ${sessionId}`, error);
      throw error;
    }
  }

  static async finishSession(sessionId: string, status: string) {
    try {
      logger.info(`Finishing database session ${sessionId} with status: ${status}`);
      return await prisma.session.update({
        where: { id: sessionId },
        data: {
          status,
          endedAt: new Date()
        }
      });
    } catch (error) {
      logger.error(`Failed to finish database session ${sessionId}`, error);
      throw error;
    }
  }

  static async getHistory() {
    try {
      return await prisma.session.findMany({
        orderBy: { startedAt: 'desc' },
        include: {
          steps: {
            orderBy: { timestamp: 'asc' }
          }
        }
      });
    } catch (error) {
      logger.error('Failed to query sessions history', error);
      throw error;
    }
  }

  static async getSessionDetails(sessionId: string) {
    try {
      return await prisma.session.findUnique({
        where: { id: sessionId },
        include: {
          steps: {
            orderBy: { timestamp: 'asc' }
          }
        }
      });
    } catch (error) {
      logger.error(`Failed to query session details for ${sessionId}`, error);
      throw error;
    }
  }
}
