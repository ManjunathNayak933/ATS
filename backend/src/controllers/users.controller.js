import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Get company info
export const getCompany = async (req, res, next) => {
  try {
    const company = await prisma.company.findUnique({
      where: { id: req.user.companyId },
      select: {
        id: true,
        name: true,
        email: true,
        logoUrl: true,
        createdAt: true
      }
    });

    res.json({
      success: true,
      ...company
    });
  } catch (error) {
    next(error);
  }
};

// Update company info
export const updateCompany = async (req, res, next) => {
  try {
    const { name, email, logoUrl } = req.body;

    const company = await prisma.company.update({
      where: { id: req.user.companyId },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(logoUrl !== undefined && { logoUrl })
      }
    });

    res.json({
      success: true,
      message: 'Company updated successfully',
      company
    });
  } catch (error) {
    next(error);
  }
};

// Get HR team
export const getTeam = async (req, res, next) => {
  try {
    const team = await prisma.user.findMany({
      where: {
        companyId: req.user.companyId
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    res.json({
      success: true,
      team
    });
  } catch (error) {
    next(error);
  }
};

// Add team member
export const addTeamMember = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Only admins can add team members
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can add team members'
      });
    }

    // Validate
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required'
      });
    }

    // Check if email exists
    const existing = await prisma.user.findUnique({
      where: { email }
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Email already in use'
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: role || 'HR',
        companyId: req.user.companyId
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });

    res.status(201).json({
      success: true,
      message: 'Team member added successfully',
      user
    });
  } catch (error) {
    next(error);
  }
};

// Remove team member
export const removeTeamMember = async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Only admins can remove team members
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can remove team members'
      });
    }

    // Can't remove yourself
    if (userId === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot remove yourself'
      });
    }

    // Verify user belongs to same company
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        companyId: req.user.companyId
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await prisma.user.delete({
      where: { id: userId }
    });

    res.json({
      success: true,
      message: 'Team member removed successfully'
    });
  } catch (error) {
    next(error);
  }
};
