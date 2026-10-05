import { Router } from 'express';
import mongoose from 'mongoose';
import authRoutes from './auth.routes';
import projectRoutes from './project.routes';
import materialRoutes from './material.routes';
import supplierRoutes from './supplier.routes';
import userRoutes from './user.routes';
import purchaseOrderRoutes from './purchaseOrder.routes';
import inventoryRoutes from './inventory.routes';
import wasteRoutes from './waste.routes';
import consumptionRoutes from './consumption.routes';
import analyticsRoutes from './analytics.routes';
import dashboardRoutes from './dashboard.routes';
import aiRoutes from './ai.routes';

const router = Router();

// Health check endpoint
router.get('/health', (_req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  res.json({
    status: isDbConnected ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    dbStatus: isDbConnected ? 'connected' : 'disconnected',
  });
});

// Mount sub-routers
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/projects', projectRoutes);
router.use('/materials', materialRoutes);
router.use('/suppliers', supplierRoutes);
router.use('/purchase-orders', purchaseOrderRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/waste', wasteRoutes);
router.use('/consumption-plans', consumptionRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/ai', aiRoutes);

export default router;
