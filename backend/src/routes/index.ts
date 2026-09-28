import { Router } from 'express';
import authRoutes from './auth.routes';
import projectRoutes from './project.routes';
import materialRoutes from './material.routes';
import supplierRoutes from './supplier.routes';
import userRoutes from './user.routes';
import purchaseOrderRoutes from './purchaseOrder.routes';
import inventoryRoutes from './inventory.routes';

const router = Router();

// Health check endpoint
router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
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

export default router;
