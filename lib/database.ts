// Database connection and utilities (MySQL persistence)
import mysql from 'mysql2/promise'
import type { Pool } from 'mysql2/promise'

export interface Notice {
  id: string
  title: string
  content: string
  type: 'announcement' | 'maintenance' | 'urgent' | 'update' | 'reminder'
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'active' | 'expired' | 'draft'
  createdAt: string
  expiresAt?: string
  isPinned: boolean
  author: string
  tags: string[]
}

export interface Invoice {
  id: string
  invoiceNumber: string
  clientName: string
  clientEmail?: string
  clientPhone?: string
  clientAddress?: string
  issueDate: string
  dueDate: string
  renewalDate?: string
  items: Array<{
    description: string
    quantity: number
    unitPrice: number
    totalPrice: number
  }>
  subtotal: number
  taxRate: number
  taxAmount: number
  totalAmount: number
  notes?: string
  status: 'draft' | 'sent' | 'paid' | 'overdue'
  createdAt: string
  updatedAt: string
}

export interface Reminder {
  id: string
  title: string
  description: string
  date: string
  time: string
  priority: 'low' | 'medium' | 'high'
  status: 'pending' | 'completed'
  type: 'meeting' | 'deadline' | 'reminder' | 'event'
}

export interface Bill {
  id: string
  description: string
  amount: number
  date: string
  imageUrl?: string
  imagePath?: string
  imageName?: string
  category: 'office' | 'utilities' | 'equipment' | 'maintenance' | 'travel' | 'other'
  vendor: string
  status: 'pending' | 'approved' | 'paid' | 'rejected'
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface Ticket {
  id: string
  clientId: string
  clientName: string
  clientEmail: string
  subject: string
  description: string
  category: 'technical' | 'billing' | 'general' | 'urgent' | 'feature-request'
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'open' | 'in-progress' | 'resolved' | 'closed'
  createdAt: string
  updatedAt: string
  resolvedAt?: string
  resolvedBy?: string
}

export interface ChatMessage {
  id: string
  clientId: string
  clientName: string
  clientEmail: string
  message: string
  sender: 'client' | 'admin'
  senderName?: string
  isRead: boolean
  createdAt: string
}

export interface InternStudent {
  id: string
  name: string
  email: string
  branch: string
  passoutYear: number
  performance?: 'excellent' | 'good' | 'average' | 'bad'
  createdAt: string
  updatedAt: string
}

export interface Port {
  id: string
  vmName: string
  portNumber: number
  status: 'used' | 'not-used'
  privateIp: string
  reason: string
  createdAt: string
  updatedAt: string
}

export interface Credential {
  id: string
  platformName: string
  userId: string
  password: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface ShowcaseProject {
  id: string
  name: string
  description: string
  logo: string
  projectImage?: string
  url?: string
  category: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface GalleryImage {
  id: string
  title: string
  description?: string
  imageUrl: string
  category: string
  tags: string[]
  isVisible: boolean
  uploadedBy?: string
  views: number
  createdAt: string
  updatedAt: string
}

export interface Dataset {
  id: string
  title: string
  description: string
  fileUrl: string
  fileName: string
  fileSize: number
  fileType: string
  category: string
  tags: string[]
  downloads: number
  views: number
  isPublic: boolean
  uploadedBy?: string
  createdAt: string
  updatedAt: string
}

// MySQL configuration (same as projects API)
const databaseConfig = {
  host: process.env.DB_HOST || '91.108.105.168',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Saurabh@2000',
  database: process.env.DB_NAME || 'ycis_datacenter',
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONN_LIMIT || 50), // Increased from 10 to 50
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  maxIdle: 10, // Max idle connections (released after idle timeout)
  idleTimeout: 60000, // Close idle connections after 60 seconds
  connectTimeout: 10000, // Connection timeout 10 seconds
  acquireTimeout: 30000 // Acquire connection timeout 30 seconds
}

let pool: mysql.Pool | null = null

const getPool = async (): Promise<mysql.Pool> => {
  if (!pool) {
    try {
      pool = mysql.createPool(databaseConfig)
      // Test the connection
      const connection = await pool.getConnection()
      connection.release()
      console.log('✓ Database connection pool created successfully')
      console.log(`  Connection limit: ${databaseConfig.connectionLimit}`)
    } catch (error) {
      console.error('✗ Failed to create database connection pool:', error)
      // Reset pool on error
      pool = null
      throw error
    }
  }
  return pool
}

// Graceful shutdown - close pool when needed
const closePool = async () => {
  if (pool) {
    try {
      await pool.end()
      pool = null
      console.log('✓ Database connection pool closed')
    } catch (error) {
      console.error('✗ Error closing database pool:', error)
    }
  }
}

// Handle process termination
if (typeof process !== 'undefined') {
  process.on('SIGINT', async () => {
    await closePool()
    process.exit(0)
  })
  
  process.on('SIGTERM', async () => {
    await closePool()
    process.exit(0)
  })
}

const initializeCoreTables = async () => {
  try {
    const pool = await getPool()
    console.log('Initializing database tables...')
  // Invoices and items
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS invoices (
      id BIGINT PRIMARY KEY,
      invoice_number VARCHAR(50) NOT NULL UNIQUE,
      client_name VARCHAR(255) NOT NULL,
      client_email VARCHAR(255),
      client_phone VARCHAR(50),
      client_address VARCHAR(500),
      issue_date DATE NOT NULL,
      due_date DATE NOT NULL,
      renewal_date DATE NULL,
      subtotal DECIMAL(12,2) DEFAULT 0,
      tax_rate DECIMAL(5,2) DEFAULT 0,
      tax_amount DECIMAL(12,2) DEFAULT 0,
      total_amount DECIMAL(12,2) DEFAULT 0,
      notes TEXT,
      status ENUM('draft','sent','paid','overdue') DEFAULT 'draft',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_invoice_number (invoice_number),
      INDEX idx_client_email (client_email)
    )
  `)
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS invoice_items (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      invoice_id BIGINT NOT NULL,
      description VARCHAR(500) NOT NULL,
      quantity INT NOT NULL,
      unit_price DECIMAL(12,2) NOT NULL,
      total_price DECIMAL(12,2) NOT NULL,
      FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
      INDEX idx_invoice_id (invoice_id)
    )
  `)
  // Bills
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS bills (
      id BIGINT PRIMARY KEY,
      description VARCHAR(500) NOT NULL,
      amount DECIMAL(12,2) NOT NULL,
      date DATE NOT NULL,
      image_url LONGTEXT,
      image_name VARCHAR(255),
      category ENUM('office','utilities','equipment','maintenance','travel','other') NOT NULL,
      vendor VARCHAR(255) NOT NULL,
      status ENUM('pending','approved','paid','rejected') DEFAULT 'pending',
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `)
  // Notices
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS notices (
      id BIGINT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      content TEXT NOT NULL,
      type ENUM('announcement','maintenance','urgent','update','reminder') DEFAULT 'announcement',
      priority ENUM('low','medium','high','critical') DEFAULT 'medium',
      status ENUM('active','expired','draft') DEFAULT 'active',
      expires_at DATE NULL,
      is_pinned BOOLEAN DEFAULT FALSE,
      author VARCHAR(255) NOT NULL,
      tags JSON,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_status (status),
      INDEX idx_type (type)
    )
  `)
  // Tickets
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS tickets (
      id BIGINT PRIMARY KEY,
      client_id VARCHAR(50) NOT NULL,
      client_name VARCHAR(255) NOT NULL,
      client_email VARCHAR(255) NOT NULL,
      subject VARCHAR(500) NOT NULL,
      description TEXT NOT NULL,
      category ENUM('technical','billing','general','urgent','feature-request') DEFAULT 'general',
      priority ENUM('low','medium','high','critical') DEFAULT 'medium',
      status ENUM('open','in-progress','resolved','closed') DEFAULT 'open',
      resolved_at TIMESTAMP NULL,
      resolved_by VARCHAR(255) NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_client_email (client_email),
      INDEX idx_status (status)
    )
  `)
  // Ports
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS ports (
      id BIGINT PRIMARY KEY,
      vm_name VARCHAR(255) NOT NULL,
      port_number INT NOT NULL,
      status ENUM('used','not-used') DEFAULT 'not-used',
      private_ip VARCHAR(50) NOT NULL,
      reason TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_vm_name (vm_name),
      INDEX idx_status (status),
      INDEX idx_port_number (port_number)
    )
  `)
  // Credentials
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS credentials (
      id BIGINT PRIMARY KEY,
      platform_name VARCHAR(255) NOT NULL,
      user_id VARCHAR(500) NOT NULL,
      password TEXT NOT NULL,
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_platform_name (platform_name)
    )
  `)
  // Showcase Projects
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS showcase_projects (
      id BIGINT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      logo LONGTEXT,
      project_image LONGTEXT,
      url VARCHAR(500),
      category VARCHAR(100) NOT NULL,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_category (category),
      INDEX idx_is_active (is_active)
    )
  `)
  // Reminders
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS reminders (
      id BIGINT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      date DATE NOT NULL,
      time VARCHAR(10),
      priority ENUM('low','medium','high') DEFAULT 'medium',
      status ENUM('pending','completed') DEFAULT 'pending',
      type ENUM('meeting','deadline','reminder','event') DEFAULT 'reminder',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_date (date),
      INDEX idx_status (status)
    )
  `)
  // Chat Messages
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS chat_messages (
      id BIGINT PRIMARY KEY,
      client_id VARCHAR(50) NOT NULL,
      client_name VARCHAR(255) NOT NULL,
      client_email VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      sender ENUM('client','admin') NOT NULL,
      sender_name VARCHAR(255),
      is_read BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_client_email (client_email),
      INDEX idx_created_at (created_at),
      INDEX idx_is_read (is_read)
    )
  `)
  // Intern Students
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS intern_students (
      id BIGINT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      branch VARCHAR(255) NOT NULL,
      passout_year INT NOT NULL,
      performance ENUM('excellent','good','average','bad'),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_email (email),
      INDEX idx_branch (branch),
      INDEX idx_passout_year (passout_year)
    )
  `)
  // Gallery
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS gallery (
      id BIGINT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      image_url LONGTEXT NOT NULL,
      category VARCHAR(100) NOT NULL,
      tags JSON,
      is_visible BOOLEAN DEFAULT TRUE,
      uploaded_by VARCHAR(255),
      views INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_category (category),
      INDEX idx_is_visible (is_visible)
    )
  `)
  // Datasets
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS datasets (
      id BIGINT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      file_url LONGTEXT NOT NULL,
      file_name VARCHAR(255) NOT NULL,
      file_size BIGINT NOT NULL,
      file_type VARCHAR(100) NOT NULL,
      category VARCHAR(100) NOT NULL,
      tags JSON,
      downloads INT DEFAULT 0,
      views INT DEFAULT 0,
      is_public BOOLEAN DEFAULT TRUE,
      uploaded_by VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_category (category),
      INDEX idx_is_public (is_public),
      INDEX idx_created_at (created_at)
    )
  `)
    
    // Try to modify existing gallery table if needed
    try {
      await pool.execute(`ALTER TABLE gallery MODIFY COLUMN image_url LONGTEXT NOT NULL`)
      console.log('✓ Gallery table updated to support large images')
    } catch (err) {
      // Ignore if column already has correct type or table doesn't exist yet
      console.log('Gallery table schema check complete')
    }
    
    // Try to modify existing showcase_projects table to support large images
    try {
      await pool.execute(`ALTER TABLE showcase_projects MODIFY COLUMN logo LONGTEXT`)
      await pool.execute(`ALTER TABLE showcase_projects MODIFY COLUMN project_image LONGTEXT`)
      console.log('✓ Showcase projects table updated to support large images')
    } catch (err) {
      // Ignore if columns already have correct type or table doesn't exist yet
      console.log('Showcase projects table schema check complete')
    }
    
    // Try to modify existing bills table to support large base64 images
    try {
      await pool.execute(`ALTER TABLE bills MODIFY COLUMN image_url LONGTEXT`)
      console.log('✓ Bills table updated to support large images')
    } catch (err) {
      // Ignore if column already has correct type or table doesn't exist yet
      console.log('Bills table schema check complete')
    }
    
    console.log('✓ All database tables initialized successfully')
  } catch (error) {
    console.error('✗ Error initializing database tables:', error)
    throw error
  }
}

export const db = {
  // Get all notices
  async getNotices(): Promise<Notice[]> {
    await initializeCoreTables()
    const pool = await getPool()
    const [rows] = await pool.query(`
      SELECT id, title, content, type, priority, status, 
             created_at AS createdAt, expires_at AS expiresAt, 
             is_pinned AS isPinned, author, tags 
      FROM notices 
      ORDER BY is_pinned DESC, created_at DESC
    `)
    return (rows as any[]).map(r => ({
      id: String(r.id),
      title: r.title,
      content: r.content,
      type: r.type,
      priority: r.priority,
      status: r.status,
      createdAt: r.createdAt,
      expiresAt: r.expiresAt || undefined,
      isPinned: Boolean(r.isPinned),
      author: r.author,
      tags: r.tags ? JSON.parse(r.tags) : []
    }))
  },

  // Get notice by ID
  async getNotice(id: string): Promise<Notice | null> {
    await initializeCoreTables()
    const pool = await getPool()
    const [rows] = await pool.query(`
      SELECT id, title, content, type, priority, status, 
             created_at AS createdAt, expires_at AS expiresAt, 
             is_pinned AS isPinned, author, tags 
      FROM notices WHERE id = ? LIMIT 1
    `, [id])
    const r = (rows as any[])[0]
    if (!r) return null
    return {
      id: String(r.id),
      title: r.title,
      content: r.content,
      type: r.type,
      priority: r.priority,
      status: r.status,
      createdAt: r.createdAt,
      expiresAt: r.expiresAt || undefined,
      isPinned: Boolean(r.isPinned),
      author: r.author,
      tags: r.tags ? JSON.parse(r.tags) : []
    }
  },

  // Create new notice
  async createNotice(notice: Omit<Notice, 'id' | 'createdAt'>): Promise<Notice> {
    await initializeCoreTables()
    const pool = await getPool()
    const id = Math.floor(Date.now() / 1000) + Math.floor(Math.random() * 100000)
    const now = new Date()
    await pool.execute(
      `INSERT INTO notices (id, title, content, type, priority, status, expires_at, is_pinned, author, tags, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        notice.title,
        notice.content,
        notice.type,
        notice.priority,
        notice.status,
        notice.expiresAt || null,
        notice.isPinned ? 1 : 0,
        notice.author,
        JSON.stringify(notice.tags),
        now
      ]
    )
    return { 
      ...notice, 
      id: String(id), 
      createdAt: now.toISOString().split('T')[0]
    }
  },

  // Update notice
  async updateNotice(id: string, updates: Partial<Notice>): Promise<Notice | null> {
    await initializeCoreTables()
    const pool = await getPool()
    const fields: string[] = []
    const values: any[] = []
    const map: Record<string, string> = {
      title: 'title',
      content: 'content',
      type: 'type',
      priority: 'priority',
      status: 'status',
      expiresAt: 'expires_at',
      isPinned: 'is_pinned',
      author: 'author',
      tags: 'tags'
    }
    Object.entries(updates).forEach(([k, v]) => {
      if (v === undefined) return
      const col = map[k]
      if (col) {
        fields.push(`${col} = ?`)
        if (k === 'tags') {
          values.push(JSON.stringify(v))
        } else if (k === 'isPinned') {
          values.push(v ? 1 : 0)
        } else {
          values.push(v)
        }
      }
    })
    if (fields.length === 0) return await this.getNotice(id)
    values.push(id)
    await pool.execute(`UPDATE notices SET ${fields.join(', ')} WHERE id = ?`, values)
    return await this.getNotice(id)
  },

  // Delete notice
  async deleteNotice(id: string): Promise<boolean> {
    await initializeCoreTables()
    const pool = await getPool()
    const [result] = await pool.execute(`DELETE FROM notices WHERE id = ?`, [id])
    // @ts-ignore
    return result.affectedRows > 0
  },

  // Search notices
  async searchNotices(query: string): Promise<Notice[]> {
    await initializeCoreTables()
    const pool = await getPool()
    const searchTerm = `%${query}%`
    const [rows] = await pool.query(`
      SELECT id, title, content, type, priority, status, 
             created_at AS createdAt, expires_at AS expiresAt, 
             is_pinned AS isPinned, author, tags 
      FROM notices 
      WHERE title LIKE ? OR content LIKE ? OR author LIKE ?
      ORDER BY is_pinned DESC, created_at DESC
    `, [searchTerm, searchTerm, searchTerm])
    return (rows as any[]).map(r => ({
      id: String(r.id),
      title: r.title,
      content: r.content,
      type: r.type,
      priority: r.priority,
      status: r.status,
      createdAt: r.createdAt,
      expiresAt: r.expiresAt || undefined,
      isPinned: Boolean(r.isPinned),
      author: r.author,
      tags: r.tags ? JSON.parse(r.tags) : []
    }))
  },

  // Get all reminders
  async getReminders(): Promise<Reminder[]> {
    await initializeCoreTables()
    const pool = await getPool()
    const [rows] = await pool.query(`
      SELECT id, title, description, date, time, priority, status, type, created_at, updated_at 
      FROM reminders 
      ORDER BY date DESC, time DESC
    `)
    return (rows as any[]).map(r => ({
      id: String(r.id),
      title: r.title,
      description: r.description,
      date: r.date,
      time: r.time,
      priority: r.priority,
      status: r.status,
      type: r.type
    }))
  },

  // Get reminder by ID
  async getReminder(id: string): Promise<Reminder | null> {
    await initializeCoreTables()
    const pool = await getPool()
    const [rows] = await pool.query(`
      SELECT id, title, description, date, time, priority, status, type 
      FROM reminders WHERE id = ? LIMIT 1
    `, [id])
    const r = (rows as any[])[0]
    if (!r) return null
    return {
      id: String(r.id),
      title: r.title,
      description: r.description,
      date: r.date,
      time: r.time,
      priority: r.priority,
      status: r.status,
      type: r.type
    }
  },

  // Create new reminder
  async createReminder(reminder: Omit<Reminder, 'id'>): Promise<Reminder> {
    await initializeCoreTables()
    const pool = await getPool()
    const id = Math.floor(Date.now() / 1000) + Math.floor(Math.random() * 100000)
    await pool.execute(
      `INSERT INTO reminders (id, title, description, date, time, priority, status, type)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        reminder.title,
        reminder.description || null,
        reminder.date,
        reminder.time || null,
        reminder.priority,
        reminder.status,
        reminder.type
      ]
    )
    return { ...reminder, id: String(id) }
  },

  // Update reminder
  async updateReminder(id: string, updates: Partial<Reminder>): Promise<Reminder | null> {
    await initializeCoreTables()
    const pool = await getPool()
    const fields: string[] = []
    const values: any[] = []
    const map: Record<string, string> = {
      title: 'title',
      description: 'description',
      date: 'date',
      time: 'time',
      priority: 'priority',
      status: 'status',
      type: 'type'
    }
    Object.entries(updates).forEach(([k, v]) => {
      if (v === undefined) return
      const col = map[k]
      if (col) {
        fields.push(`${col} = ?`)
        values.push(v)
      }
    })
    if (fields.length === 0) return await this.getReminder(id)
    values.push(id)
    await pool.execute(`UPDATE reminders SET ${fields.join(', ')} WHERE id = ?`, values)
    return await this.getReminder(id)
  },

  // Delete reminder
  async deleteReminder(id: string): Promise<boolean> {
    await initializeCoreTables()
    const pool = await getPool()
    const [result] = await pool.execute(`DELETE FROM reminders WHERE id = ?`, [id])
    // @ts-ignore
    return result.affectedRows > 0
  },

  // Get all bills
  async getBills(): Promise<Bill[]> {
    await initializeCoreTables()
    const pool = await getPool()
    const [rows] = await pool.query(`SELECT id, description, amount, date, image_url AS imageUrl, image_name AS imageName, category, vendor, status, notes, created_at AS createdAt, updated_at AS updatedAt FROM bills ORDER BY date DESC, created_at DESC`)
    return (rows as any[]).map(r => ({
      id: String(r.id),
      description: r.description,
      amount: Number(r.amount),
      date: r.date,
      imageUrl: r.imageUrl || undefined,
      imageName: r.imageName || undefined,
      category: r.category,
      vendor: r.vendor,
      status: r.status,
      notes: r.notes || undefined,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt
    }))
  },

  // Get bill by ID
  async getBill(id: string): Promise<Bill | null> {
    await initializeCoreTables()
    const pool = await getPool()
    const [rows] = await pool.query(`SELECT id, description, amount, date, image_url AS imageUrl, image_name AS imageName, category, vendor, status, notes, created_at AS createdAt, updated_at AS updatedAt FROM bills WHERE id = ? LIMIT 1`, [id])
    const r = (rows as any[])[0]
    if (!r) return null
    return {
      id: String(r.id),
      description: r.description,
      amount: Number(r.amount),
      date: r.date,
      imageUrl: r.imageUrl || undefined,
      imageName: r.imageName || undefined,
      category: r.category,
      vendor: r.vendor,
      status: r.status,
      notes: r.notes || undefined,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt
    }
  },

  // Create new bill
  async createBill(bill: Omit<Bill, 'id' | 'createdAt' | 'updatedAt'>): Promise<Bill> {
    await initializeCoreTables()
    const pool = await getPool()
    const id = Math.floor(Date.now() / 1000) + Math.floor(Math.random() * 100000)
    const now = new Date()
    await pool.execute(
      `INSERT INTO bills (id, description, amount, date, image_url, image_name, category, vendor, status, notes, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        bill.description,
        bill.amount,
        bill.date,
        bill.imageUrl || null,
        bill.imageName || null,
        bill.category,
        bill.vendor,
        bill.status || 'pending',
        bill.notes || null,
        now,
        now
      ]
    )
    return { ...bill, id: String(id), createdAt: now.toISOString(), updatedAt: now.toISOString() }
  },

  // Update bill
  async updateBill(id: string, updates: Partial<Bill>): Promise<Bill | null> {
    await initializeCoreTables()
    const pool = await getPool()
    const fields: string[] = []
    const values: any[] = []
    const map: Record<string, string> = {
      description: 'description',
      amount: 'amount',
      date: 'date',
      imageUrl: 'image_url',
      imageName: 'image_name',
      category: 'category',
      vendor: 'vendor',
      status: 'status',
      notes: 'notes'
    }
    Object.entries(updates).forEach(([k, v]) => {
      if (v === undefined) return
      const col = map[k]
      if (col) {
        fields.push(`${col} = ?`)
        values.push(v)
      }
    })
    if (fields.length === 0) return await this.getBill(id)
    values.push(id)
    await pool.execute(`UPDATE bills SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, values)
    return await this.getBill(id)
  },

  // Delete bill
  async deleteBill(id: string): Promise<boolean> {
    await initializeCoreTables()
    const pool = await getPool()
    const [result] = await pool.execute(`DELETE FROM bills WHERE id = ?`, [id])
    // @ts-ignore
    return result.affectedRows > 0
  },

  // Get all tickets
  async getTickets(): Promise<Ticket[]> {
    await initializeCoreTables()
    const pool = await getPool()
    const [rows] = await pool.query(`
      SELECT id, client_id AS clientId, client_name AS clientName, client_email AS clientEmail,
             subject, description, category, priority, status, 
             resolved_at AS resolvedAt, resolved_by AS resolvedBy,
             created_at AS createdAt, updated_at AS updatedAt 
      FROM tickets 
      ORDER BY created_at DESC
    `)
    return (rows as any[]).map(r => ({
      id: String(r.id),
      clientId: r.clientId,
      clientName: r.clientName,
      clientEmail: r.clientEmail,
      subject: r.subject,
      description: r.description,
      category: r.category,
      priority: r.priority,
      status: r.status,
      resolvedAt: r.resolvedAt || undefined,
      resolvedBy: r.resolvedBy || undefined,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt
    }))
  },

  // Get ticket by ID
  async getTicket(id: string): Promise<Ticket | null> {
    await initializeCoreTables()
    const pool = await getPool()
    const [rows] = await pool.query(`
      SELECT id, client_id AS clientId, client_name AS clientName, client_email AS clientEmail,
             subject, description, category, priority, status, 
             resolved_at AS resolvedAt, resolved_by AS resolvedBy,
             created_at AS createdAt, updated_at AS updatedAt 
      FROM tickets WHERE id = ? LIMIT 1
    `, [id])
    const r = (rows as any[])[0]
    if (!r) return null
    return {
      id: String(r.id),
      clientId: r.clientId,
      clientName: r.clientName,
      clientEmail: r.clientEmail,
      subject: r.subject,
      description: r.description,
      category: r.category,
      priority: r.priority,
      status: r.status,
      resolvedAt: r.resolvedAt || undefined,
      resolvedBy: r.resolvedBy || undefined,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt
    }
  },

  // Get tickets by client email
  async getTicketsByClientEmail(email: string): Promise<Ticket[]> {
    await initializeCoreTables()
    const pool = await getPool()
    const [rows] = await pool.query(`
      SELECT id, client_id AS clientId, client_name AS clientName, client_email AS clientEmail,
             subject, description, category, priority, status, 
             resolved_at AS resolvedAt, resolved_by AS resolvedBy,
             created_at AS createdAt, updated_at AS updatedAt 
      FROM tickets 
      WHERE LOWER(client_email) = LOWER(?)
      ORDER BY created_at DESC
    `, [email])
    return (rows as any[]).map(r => ({
      id: String(r.id),
      clientId: r.clientId,
      clientName: r.clientName,
      clientEmail: r.clientEmail,
      subject: r.subject,
      description: r.description,
      category: r.category,
      priority: r.priority,
      status: r.status,
      resolvedAt: r.resolvedAt || undefined,
      resolvedBy: r.resolvedBy || undefined,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt
    }))
  },

  // Create new ticket
  async createTicket(ticket: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'>): Promise<Ticket> {
    await initializeCoreTables()
    const pool = await getPool()
    const id = Math.floor(Date.now() / 1000) + Math.floor(Math.random() * 100000)
    const now = new Date()
    await pool.execute(
      `INSERT INTO tickets (id, client_id, client_name, client_email, subject, description, category, priority, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        ticket.clientId,
        ticket.clientName,
        ticket.clientEmail,
        ticket.subject,
        ticket.description,
        ticket.category,
        ticket.priority,
        ticket.status,
        now,
        now
      ]
    )
    return { 
      ...ticket, 
      id: String(id), 
      createdAt: now.toISOString(), 
      updatedAt: now.toISOString() 
    }
  },

  // Update ticket
  async updateTicket(id: string, updates: Partial<Ticket>): Promise<Ticket | null> {
    await initializeCoreTables()
    const pool = await getPool()
    const fields: string[] = []
    const values: any[] = []
    const map: Record<string, string> = {
      clientId: 'client_id',
      clientName: 'client_name',
      clientEmail: 'client_email',
      subject: 'subject',
      description: 'description',
      category: 'category',
      priority: 'priority',
      status: 'status',
      resolvedAt: 'resolved_at',
      resolvedBy: 'resolved_by'
    }
    Object.entries(updates).forEach(([k, v]) => {
      if (v === undefined) return
      const col = map[k]
      if (col) {
        fields.push(`${col} = ?`)
        values.push(v)
      }
    })
    if (fields.length === 0) return await this.getTicket(id)
    values.push(id)
    await pool.execute(`UPDATE tickets SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, values)
    return await this.getTicket(id)
  },

  // Delete ticket
  async deleteTicket(id: string): Promise<boolean> {
    await initializeCoreTables()
    const pool = await getPool()
    const [result] = await pool.execute(`DELETE FROM tickets WHERE id = ?`, [id])
    // @ts-ignore
    return result.affectedRows > 0
  },

  // Chat Messages Operations
  async getChatMessages(clientEmail?: string): Promise<ChatMessage[]> {
    await initializeCoreTables()
    const pool = await getPool()
    let query = `
      SELECT id, client_id AS clientId, client_name AS clientName, client_email AS clientEmail,
             message, sender, sender_name AS senderName, is_read AS isRead,
             created_at AS createdAt
      FROM chat_messages
    `
    const params: any[] = []
    if (clientEmail) {
      query += ` WHERE client_email = ?`
      params.push(clientEmail)
    }
    query += ` ORDER BY created_at ASC`
    
    const [rows] = await pool.query(query, params)
    return (rows as any[]).map(r => ({
      id: String(r.id),
      clientId: r.clientId,
      clientName: r.clientName,
      clientEmail: r.clientEmail,
      message: r.message,
      sender: r.sender,
      senderName: r.senderName || undefined,
      isRead: Boolean(r.isRead),
      createdAt: r.createdAt
    }))
  },

  async createChatMessage(message: Omit<ChatMessage, 'id' | 'createdAt'>): Promise<ChatMessage> {
    await initializeCoreTables()
    const pool = await getPool()
    const id = Math.floor(Date.now() / 1000) + Math.floor(Math.random() * 100000)
    const now = new Date()
    await pool.execute(
      `INSERT INTO chat_messages (id, client_id, client_name, client_email, message, sender, sender_name, is_read, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        message.clientId,
        message.clientName,
        message.clientEmail,
        message.message,
        message.sender,
        message.senderName || null,
        message.isRead || false,
        now
      ]
    )
    return {
      ...message,
      id: String(id),
      createdAt: now.toISOString()
    }
  },

  async markMessagesAsRead(clientEmail: string): Promise<void> {
    await initializeCoreTables()
    const pool = await getPool()
    await pool.execute(
      `UPDATE chat_messages SET is_read = TRUE WHERE client_email = ? AND sender = 'client'`,
      [clientEmail]
    )
  },

  async getUnreadMessageCount(clientEmail?: string): Promise<number> {
    await initializeCoreTables()
    const pool = await getPool()
    let query = `SELECT COUNT(*) as count FROM chat_messages WHERE is_read = FALSE`
    const params: any[] = []
    if (clientEmail) {
      query += ` AND client_email = ? AND sender = 'client'`
      params.push(clientEmail)
    } else {
      query += ` AND sender = 'client'`
    }
    const [rows] = await pool.query(query, params)
    return (rows as any[])[0]?.count || 0
  },

  async getChatClients(): Promise<Array<{ clientEmail: string; clientName: string; lastMessage: string; lastMessageTime: string; unreadCount: number }>> {
    await initializeCoreTables()
    const pool = await getPool()
    const [rows] = await pool.query(`
      SELECT 
        client_email AS clientEmail,
        client_name AS clientName,
        MAX(created_at) AS lastMessageTime,
        (SELECT message FROM chat_messages cm2 
         WHERE cm2.client_email = cm.client_email 
         ORDER BY cm2.created_at DESC LIMIT 1) AS lastMessage,
        COUNT(CASE WHEN is_read = FALSE AND sender = 'client' THEN 1 END) AS unreadCount
      FROM chat_messages cm
      GROUP BY client_email, client_name
      ORDER BY lastMessageTime DESC
    `)
    return (rows as any[]).map(r => ({
      clientEmail: r.clientEmail,
      clientName: r.clientName,
      lastMessage: r.lastMessage || '',
      lastMessageTime: r.lastMessageTime,
      unreadCount: Number(r.unreadCount) || 0
    }))
  },

  // Intern Students Operations
  async getInternStudents(): Promise<InternStudent[]> {
    await initializeCoreTables()
    const pool = await getPool()
    const [rows] = await pool.query(`
      SELECT id, name, email, branch, passout_year AS passoutYear, performance,
             created_at AS createdAt, updated_at AS updatedAt
      FROM intern_students
      ORDER BY created_at DESC
    `)
    return (rows as any[]).map(r => ({
      id: String(r.id),
      name: r.name,
      email: r.email,
      branch: r.branch,
      passoutYear: r.passoutYear,
      performance: r.performance || undefined,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt
    }))
  },

  async getInternStudent(id: string): Promise<InternStudent | null> {
    await initializeCoreTables()
    const pool = await getPool()
    const [rows] = await pool.query(`
      SELECT id, name, email, branch, passout_year AS passoutYear, performance,
             created_at AS createdAt, updated_at AS updatedAt
      FROM intern_students WHERE id = ? LIMIT 1
    `, [id])
    const r = (rows as any[])[0]
    if (!r) return null
    return {
      id: String(r.id),
      name: r.name,
      email: r.email,
      branch: r.branch,
      passoutYear: r.passoutYear,
      performance: r.performance || undefined,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt
    }
  },

  async createInternStudent(student: Omit<InternStudent, 'id' | 'createdAt' | 'updatedAt'>): Promise<InternStudent> {
    await initializeCoreTables()
    const pool = await getPool()
    const id = Math.floor(Date.now() / 1000) + Math.floor(Math.random() * 100000)
    const now = new Date()
    await pool.execute(
      `INSERT INTO intern_students (id, name, email, branch, passout_year, performance, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        student.name,
        student.email,
        student.branch,
        student.passoutYear,
        student.performance || null,
        now,
        now
      ]
    )
    return {
      ...student,
      id: String(id),
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    }
  },

  async updateInternStudent(id: string, updates: Partial<InternStudent>): Promise<InternStudent | null> {
    await initializeCoreTables()
    const pool = await getPool()
    const fields: string[] = []
    const values: any[] = []
    const map: Record<string, string> = {
      name: 'name',
      email: 'email',
      branch: 'branch',
      passoutYear: 'passout_year',
      performance: 'performance'
    }
    Object.entries(updates).forEach(([k, v]) => {
      if (v === undefined) return
      const col = map[k]
      if (col) {
        fields.push(`${col} = ?`)
        values.push(v)
      }
    })
    if (fields.length === 0) return await this.getInternStudent(id)
    values.push(id)
    await pool.execute(`UPDATE intern_students SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, values)
    return await this.getInternStudent(id)
  },

  async deleteInternStudent(id: string): Promise<boolean> {
    await initializeCoreTables()
    const pool = await getPool()
    const [result] = await pool.execute(`DELETE FROM intern_students WHERE id = ?`, [id])
    // @ts-ignore
    return result.affectedRows > 0
  },

  // Get all ports
  async getPorts(): Promise<Port[]> {
    await initializeCoreTables()
    const pool = await getPool()
    const [rows] = await pool.query(`
      SELECT id, vm_name AS vmName, port_number AS portNumber, status, 
             private_ip AS privateIp, reason,
             created_at AS createdAt, updated_at AS updatedAt 
      FROM ports 
      ORDER BY created_at DESC
    `)
    return (rows as any[]).map(r => ({
      id: String(r.id),
      vmName: r.vmName,
      portNumber: r.portNumber,
      status: r.status,
      privateIp: r.privateIp,
      reason: r.reason,
      createdAt: r.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: r.updatedAt?.toISOString() || new Date().toISOString()
    }))
  },

  // Get a single port by id
  async getPort(id: string): Promise<Port | null> {
    await initializeCoreTables()
    const pool = await getPool()
    const [rows] = await pool.query(`
      SELECT id, vm_name AS vmName, port_number AS portNumber, status, 
             private_ip AS privateIp, reason,
             created_at AS createdAt, updated_at AS updatedAt 
      FROM ports 
      WHERE id = ?
    `, [id])
    const arr = rows as any[]
    if (arr.length === 0) return null
    const r = arr[0]
    return {
      id: String(r.id),
      vmName: r.vmName,
      portNumber: r.portNumber,
      status: r.status,
      privateIp: r.privateIp,
      reason: r.reason,
      createdAt: r.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: r.updatedAt?.toISOString() || new Date().toISOString()
    }
  },

  // Create a new port
  async createPort(port: Omit<Port, 'id' | 'createdAt' | 'updatedAt'>): Promise<Port> {
    await initializeCoreTables()
    const pool = await getPool()
    const id = Math.floor(Date.now() / 1000) + Math.floor(Math.random() * 100000)
    const now = new Date()
    await pool.execute(
      `INSERT INTO ports (id, vm_name, port_number, status, private_ip, reason, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        port.vmName,
        port.portNumber,
        port.status,
        port.privateIp,
        port.reason,
        now,
        now
      ]
    )
    return {
      id: String(id),
      ...port,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    }
  },

  // Update a port
  async updatePort(id: string, updates: Partial<Omit<Port, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Port | null> {
    await initializeCoreTables()
    const pool = await getPool()
    const fields: string[] = []
    const values: any[] = []

    if (updates.vmName !== undefined) {
      fields.push('vm_name = ?')
      values.push(updates.vmName)
    }
    if (updates.portNumber !== undefined) {
      fields.push('port_number = ?')
      values.push(updates.portNumber)
    }
    if (updates.status !== undefined) {
      fields.push('status = ?')
      values.push(updates.status)
    }
    if (updates.privateIp !== undefined) {
      fields.push('private_ip = ?')
      values.push(updates.privateIp)
    }
    if (updates.reason !== undefined) {
      fields.push('reason = ?')
      values.push(updates.reason)
    }

    if (fields.length === 0) {
      return this.getPort(id)
    }

    fields.push('updated_at = ?')
    values.push(new Date())
    values.push(id)

    await pool.execute(
      `UPDATE ports SET ${fields.join(', ')} WHERE id = ?`,
      values
    )
    return this.getPort(id)
  },

  // Delete a port
  async deletePort(id: string): Promise<boolean> {
    await initializeCoreTables()
    const pool = await getPool()
    const [result] = await pool.execute(`DELETE FROM ports WHERE id = ?`, [id])
    // @ts-ignore
    return result.affectedRows > 0
  },

  // Get all credentials
  async getCredentials(): Promise<Credential[]> {
    await initializeCoreTables()
    const pool = await getPool()
    const [rows] = await pool.query(`
      SELECT id, platform_name AS platformName, user_id AS userId, password, notes,
             created_at AS createdAt, updated_at AS updatedAt 
      FROM credentials 
      ORDER BY platform_name ASC, created_at DESC
    `)
    return (rows as any[]).map(r => ({
      id: String(r.id),
      platformName: r.platformName,
      userId: r.userId,
      password: r.password,
      notes: r.notes || '',
      createdAt: r.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: r.updatedAt?.toISOString() || new Date().toISOString()
    }))
  },

  // Get a single credential by id
  async getCredential(id: string): Promise<Credential | null> {
    await initializeCoreTables()
    const pool = await getPool()
    const [rows] = await pool.query(`
      SELECT id, platform_name AS platformName, user_id AS userId, password, notes,
             created_at AS createdAt, updated_at AS updatedAt 
      FROM credentials 
      WHERE id = ?
    `, [id])
    const arr = rows as any[]
    if (arr.length === 0) return null
    const r = arr[0]
    return {
      id: String(r.id),
      platformName: r.platformName,
      userId: r.userId,
      password: r.password,
      notes: r.notes || '',
      createdAt: r.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: r.updatedAt?.toISOString() || new Date().toISOString()
    }
  },

  // Create a new credential
  async createCredential(credential: Omit<Credential, 'id' | 'createdAt' | 'updatedAt'>): Promise<Credential> {
    await initializeCoreTables()
    const pool = await getPool()
    const id = Math.floor(Date.now() / 1000) + Math.floor(Math.random() * 100000)
    const now = new Date()
    await pool.execute(
      `INSERT INTO credentials (id, platform_name, user_id, password, notes, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        credential.platformName,
        credential.userId,
        credential.password,
        credential.notes || null,
        now,
        now
      ]
    )
    return {
      id: String(id),
      ...credential,
      notes: credential.notes || '',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    }
  },

  // Update a credential
  async updateCredential(id: string, updates: Partial<Omit<Credential, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Credential | null> {
    await initializeCoreTables()
    const pool = await getPool()
    const fields: string[] = []
    const values: any[] = []

    if (updates.platformName !== undefined) {
      fields.push('platform_name = ?')
      values.push(updates.platformName)
    }
    if (updates.userId !== undefined) {
      fields.push('user_id = ?')
      values.push(updates.userId)
    }
    if (updates.password !== undefined) {
      fields.push('password = ?')
      values.push(updates.password)
    }
    if (updates.notes !== undefined) {
      fields.push('notes = ?')
      values.push(updates.notes || null)
    }

    if (fields.length === 0) {
      return this.getCredential(id)
    }

    fields.push('updated_at = ?')
    values.push(new Date())
    values.push(id)

    await pool.execute(
      `UPDATE credentials SET ${fields.join(', ')} WHERE id = ?`,
      values
    )
    return this.getCredential(id)
  },

  // Delete a credential
  async deleteCredential(id: string): Promise<boolean> {
    await initializeCoreTables()
    const pool = await getPool()
    const [result] = await pool.execute(`DELETE FROM credentials WHERE id = ?`, [id])
    // @ts-ignore
    return result.affectedRows > 0
  },

  // Get all showcase projects
  async getShowcaseProjects(): Promise<ShowcaseProject[]> {
    await initializeCoreTables()
    const pool = await getPool()
    const [rows] = await pool.query(`
      SELECT id, name, description, logo, project_image AS projectImage, url, category, 
             is_active AS isActive, created_at AS createdAt, updated_at AS updatedAt 
      FROM showcase_projects 
      ORDER BY created_at DESC
    `)
    return (rows as any[]).map(r => ({
      id: String(r.id),
      name: r.name,
      description: r.description,
      logo: r.logo || '',
      projectImage: r.projectImage || undefined,
      url: r.url || undefined,
      category: r.category,
      isActive: Boolean(r.isActive),
      createdAt: r.createdAt,
      updatedAt: r.updatedAt
    }))
  },

  // Get active showcase projects only
  async getActiveShowcaseProjects(): Promise<ShowcaseProject[]> {
    await initializeCoreTables()
    const pool = await getPool()
    const [rows] = await pool.query(`
      SELECT id, name, description, logo, project_image AS projectImage, url, category, 
             is_active AS isActive, created_at AS createdAt, updated_at AS updatedAt 
      FROM showcase_projects 
      WHERE is_active = TRUE
      ORDER BY created_at DESC
    `)
    return (rows as any[]).map(r => ({
      id: String(r.id),
      name: r.name,
      description: r.description,
      logo: r.logo || '',
      projectImage: r.projectImage || undefined,
      url: r.url || undefined,
      category: r.category,
      isActive: Boolean(r.isActive),
      createdAt: r.createdAt,
      updatedAt: r.updatedAt
    }))
  },

  // Get showcase project by ID
  async getShowcaseProject(id: string): Promise<ShowcaseProject | null> {
    await initializeCoreTables()
    const pool = await getPool()
    const [rows] = await pool.query(`
      SELECT id, name, description, logo, project_image AS projectImage, url, category, 
             is_active AS isActive, created_at AS createdAt, updated_at AS updatedAt 
      FROM showcase_projects WHERE id = ? LIMIT 1
    `, [id])
    const r = (rows as any[])[0]
    if (!r) return null
    return {
      id: String(r.id),
      name: r.name,
      description: r.description,
      logo: r.logo || '',
      projectImage: r.projectImage || undefined,
      url: r.url || undefined,
      category: r.category,
      isActive: Boolean(r.isActive),
      createdAt: r.createdAt,
      updatedAt: r.updatedAt
    }
  },

  // Create new showcase project
  async createShowcaseProject(project: Omit<ShowcaseProject, 'id' | 'createdAt' | 'updatedAt'>): Promise<ShowcaseProject> {
    await initializeCoreTables()
    const pool = await getPool()
    const id = Math.floor(Date.now() / 1000) + Math.floor(Math.random() * 100000)
    const now = new Date()
    await pool.execute(
      `INSERT INTO showcase_projects (id, name, description, logo, project_image, url, category, is_active, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        project.name,
        project.description,
        project.logo || '',
        project.projectImage || null,
        project.url || null,
        project.category,
        project.isActive ? 1 : 0,
        now,
        now
      ]
    )
    return { 
      ...project, 
      id: String(id), 
      createdAt: now.toISOString(), 
      updatedAt: now.toISOString() 
    }
  },

  // Update showcase project
  async updateShowcaseProject(id: string, updates: Partial<ShowcaseProject>): Promise<ShowcaseProject | null> {
    await initializeCoreTables()
    const pool = await getPool()
    const fields: string[] = []
    const values: any[] = []
    const map: Record<string, string> = {
      name: 'name',
      description: 'description',
      logo: 'logo',
      projectImage: 'project_image',
      url: 'url',
      category: 'category',
      isActive: 'is_active'
    }
    Object.entries(updates).forEach(([k, v]) => {
      if (v === undefined) return
      const col = map[k]
      if (col) {
        fields.push(`${col} = ?`)
        if (k === 'isActive') {
          values.push(v ? 1 : 0)
        } else {
          values.push(v)
        }
      }
    })
    if (fields.length === 0) return await this.getShowcaseProject(id)
    values.push(id)
    await pool.execute(`UPDATE showcase_projects SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, values)
    return await this.getShowcaseProject(id)
  },

  // Delete showcase project
  async deleteShowcaseProject(id: string): Promise<boolean> {
    await initializeCoreTables()
    const pool = await getPool()
    const [result] = await pool.execute(`DELETE FROM showcase_projects WHERE id = ?`, [id])
    // @ts-ignore
    return result.affectedRows > 0
  },

  // Get all gallery images
  async getGalleryImages(): Promise<GalleryImage[]> {
    await initializeCoreTables()
    const pool = await getPool()
    const [rows] = await pool.query(`
      SELECT id, title, description, image_url AS imageUrl, category, tags, 
             is_visible AS isVisible, uploaded_by AS uploadedBy, views,
             created_at AS createdAt, updated_at AS updatedAt 
      FROM gallery 
      ORDER BY created_at DESC
    `)
    return (rows as any[]).map(r => ({
      id: String(r.id),
      title: r.title,
      description: r.description || undefined,
      imageUrl: r.imageUrl,
      category: r.category,
      tags: r.tags ? JSON.parse(r.tags) : [],
      isVisible: Boolean(r.isVisible),
      uploadedBy: r.uploadedBy || undefined,
      views: r.views || 0,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt
    }))
  },

  // Get gallery image by ID
  async getGalleryImage(id: string): Promise<GalleryImage | null> {
    await initializeCoreTables()
    const pool = await getPool()
    const [rows] = await pool.query(`
      SELECT id, title, description, image_url AS imageUrl, category, tags, 
             is_visible AS isVisible, uploaded_by AS uploadedBy, views,
             created_at AS createdAt, updated_at AS updatedAt 
      FROM gallery WHERE id = ? LIMIT 1
    `, [id])
    const r = (rows as any[])[0]
    if (!r) return null
    return {
      id: String(r.id),
      title: r.title,
      description: r.description || undefined,
      imageUrl: r.imageUrl,
      category: r.category,
      tags: r.tags ? JSON.parse(r.tags) : [],
      isVisible: Boolean(r.isVisible),
      uploadedBy: r.uploadedBy || undefined,
      views: r.views || 0,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt
    }
  },

  // Create new gallery image
  async createGalleryImage(image: Omit<GalleryImage, 'id' | 'createdAt' | 'updatedAt'>): Promise<GalleryImage> {
    await initializeCoreTables()
    const pool = await getPool()
    const id = Math.floor(Date.now() / 1000) + Math.floor(Math.random() * 100000)
    const now = new Date()
    await pool.execute(
      `INSERT INTO gallery (id, title, description, image_url, category, tags, is_visible, uploaded_by, views, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        image.title,
        image.description || null,
        image.imageUrl,
        image.category,
        JSON.stringify(image.tags),
        image.isVisible ? 1 : 0,
        image.uploadedBy || null,
        image.views || 0,
        now,
        now
      ]
    )
    return { 
      ...image, 
      id: String(id), 
      createdAt: now.toISOString(), 
      updatedAt: now.toISOString() 
    }
  },

  // Update gallery image
  async updateGalleryImage(id: string, updates: Partial<GalleryImage>): Promise<GalleryImage | null> {
    await initializeCoreTables()
    const pool = await getPool()
    const fields: string[] = []
    const values: any[] = []
    const map: Record<string, string> = {
      title: 'title',
      description: 'description',
      imageUrl: 'image_url',
      category: 'category',
      tags: 'tags',
      isVisible: 'is_visible',
      uploadedBy: 'uploaded_by',
      views: 'views'
    }
    Object.entries(updates).forEach(([k, v]) => {
      if (v === undefined) return
      const col = map[k]
      if (col) {
        fields.push(`${col} = ?`)
        if (k === 'tags') {
          values.push(JSON.stringify(v))
        } else if (k === 'isVisible') {
          values.push(v ? 1 : 0)
        } else {
          values.push(v)
        }
      }
    })
    if (fields.length === 0) return await this.getGalleryImage(id)
    values.push(id)
    await pool.execute(`UPDATE gallery SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, values)
    return await this.getGalleryImage(id)
  },

  // Delete gallery image
  async deleteGalleryImage(id: string): Promise<boolean> {
    await initializeCoreTables()
    const pool = await getPool()
    const [result] = await pool.execute(`DELETE FROM gallery WHERE id = ?`, [id])
    // @ts-ignore
    return result.affectedRows > 0
  },

  // Get all datasets
  async getDatasets(publicOnly: boolean = false): Promise<Dataset[]> {
    await initializeCoreTables()
    const pool = await getPool()
    let query = `
      SELECT id, title, description, file_url AS fileUrl, file_name AS fileName, 
             file_size AS fileSize, file_type AS fileType, category, tags, 
             downloads, views, is_public AS isPublic, uploaded_by AS uploadedBy,
             created_at AS createdAt, updated_at AS updatedAt 
      FROM datasets
    `
    const params: any[] = []
    if (publicOnly) {
      query += ` WHERE is_public = TRUE`
    }
    query += ` ORDER BY created_at DESC`
    
    const [rows] = await pool.query(query, params)
    return (rows as any[]).map(r => ({
      id: String(r.id),
      title: r.title,
      description: r.description,
      fileUrl: r.fileUrl,
      fileName: r.fileName,
      fileSize: Number(r.fileSize),
      fileType: r.fileType,
      category: r.category,
      tags: r.tags ? JSON.parse(r.tags) : [],
      downloads: r.downloads || 0,
      views: r.views || 0,
      isPublic: Boolean(r.isPublic),
      uploadedBy: r.uploadedBy || undefined,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt
    }))
  },

  // Get dataset by ID
  async getDataset(id: string): Promise<Dataset | null> {
    await initializeCoreTables()
    const pool = await getPool()
    const [rows] = await pool.query(`
      SELECT id, title, description, file_url AS fileUrl, file_name AS fileName, 
             file_size AS fileSize, file_type AS fileType, category, tags, 
             downloads, views, is_public AS isPublic, uploaded_by AS uploadedBy,
             created_at AS createdAt, updated_at AS updatedAt 
      FROM datasets WHERE id = ? LIMIT 1
    `, [id])
    const r = (rows as any[])[0]
    if (!r) return null
    return {
      id: String(r.id),
      title: r.title,
      description: r.description,
      fileUrl: r.fileUrl,
      fileName: r.fileName,
      fileSize: Number(r.fileSize),
      fileType: r.fileType,
      category: r.category,
      tags: r.tags ? JSON.parse(r.tags) : [],
      downloads: r.downloads || 0,
      views: r.views || 0,
      isPublic: Boolean(r.isPublic),
      uploadedBy: r.uploadedBy || undefined,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt
    }
  },

  // Create new dataset
  async createDataset(dataset: Omit<Dataset, 'id' | 'createdAt' | 'updatedAt' | 'downloads' | 'views'>): Promise<Dataset> {
    await initializeCoreTables()
    const pool = await getPool()
    const id = Math.floor(Date.now() / 1000) + Math.floor(Math.random() * 100000)
    const now = new Date()
    await pool.execute(
      `INSERT INTO datasets (id, title, description, file_url, file_name, file_size, file_type, category, tags, downloads, views, is_public, uploaded_by, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        dataset.title,
        dataset.description,
        dataset.fileUrl,
        dataset.fileName,
        dataset.fileSize,
        dataset.fileType,
        dataset.category,
        JSON.stringify(dataset.tags),
        0, // downloads
        0, // views
        dataset.isPublic ? 1 : 0,
        dataset.uploadedBy || null,
        now,
        now
      ]
    )
    return { 
      ...dataset, 
      id: String(id), 
      downloads: 0,
      views: 0,
      createdAt: now.toISOString(), 
      updatedAt: now.toISOString() 
    }
  },

  // Update dataset
  async updateDataset(id: string, updates: Partial<Dataset>): Promise<Dataset | null> {
    await initializeCoreTables()
    const pool = await getPool()
    const fields: string[] = []
    const values: any[] = []
    const map: Record<string, string> = {
      title: 'title',
      description: 'description',
      fileUrl: 'file_url',
      fileName: 'file_name',
      fileSize: 'file_size',
      fileType: 'file_type',
      category: 'category',
      tags: 'tags',
      downloads: 'downloads',
      views: 'views',
      isPublic: 'is_public',
      uploadedBy: 'uploaded_by'
    }
    Object.entries(updates).forEach(([k, v]) => {
      if (v === undefined) return
      const col = map[k]
      if (col) {
        fields.push(`${col} = ?`)
        if (k === 'tags') {
          values.push(JSON.stringify(v))
        } else if (k === 'isPublic') {
          values.push(v ? 1 : 0)
        } else {
          values.push(v)
        }
      }
    })
    if (fields.length === 0) return await this.getDataset(id)
    values.push(id)
    await pool.execute(`UPDATE datasets SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, values)
    return await this.getDataset(id)
  },

  // Delete dataset
  async deleteDataset(id: string): Promise<boolean> {
    await initializeCoreTables()
    const pool = await getPool()
    const [result] = await pool.execute(`DELETE FROM datasets WHERE id = ?`, [id])
    // @ts-ignore
    return result.affectedRows > 0
  },

  // Increment dataset views
  async incrementDatasetViews(id: string): Promise<void> {
    await initializeCoreTables()
    const pool = await getPool()
    await pool.execute(`UPDATE datasets SET views = views + 1 WHERE id = ?`, [id])
  },

  // Increment dataset downloads
  async incrementDatasetDownloads(id: string): Promise<void> {
    await initializeCoreTables()
    const pool = await getPool()
    await pool.execute(`UPDATE datasets SET downloads = downloads + 1 WHERE id = ?`, [id])
  }
}

// Invoice operations
export const invoiceOperations = {
  async getInvoices(): Promise<Invoice[]> {
    await initializeCoreTables()
    const pool = await getPool()
    const [rows] = await pool.query(`SELECT id, invoice_number AS invoiceNumber, client_name AS clientName, client_email AS clientEmail, client_phone AS clientPhone, client_address AS clientAddress, issue_date AS issueDate, due_date AS dueDate, subtotal, tax_rate AS taxRate, tax_amount AS taxAmount, total_amount AS totalAmount, notes, status, created_at AS createdAt, updated_at AS updatedAt FROM invoices ORDER BY created_at DESC`)
    const invoices = rows as any[]
    // Load items for each invoice
    const ids = invoices.map(i => i.id)
    let itemsByInvoice: Record<string, any[]> = {}
    if (ids.length) {
      const [items] = await pool.query(`SELECT invoice_id AS invoiceId, description, quantity, unit_price AS unitPrice, total_price AS totalPrice FROM invoice_items WHERE invoice_id IN (${ids.map(() => '?').join(',')})`, ids)
      ;(items as any[]).forEach(it => {
        const key = String(it.invoiceId)
        if (!itemsByInvoice[key]) itemsByInvoice[key] = []
        itemsByInvoice[key].push({ description: it.description, quantity: it.quantity, unitPrice: Number(it.unitPrice), totalPrice: Number(it.totalPrice) })
      })
    }
    return invoices.map(inv => ({
      id: String(inv.id),
      invoiceNumber: inv.invoiceNumber,
      clientName: inv.clientName,
      clientEmail: inv.clientEmail || undefined,
      clientPhone: inv.clientPhone || undefined,
      clientAddress: inv.clientAddress || undefined,
      issueDate: inv.issueDate,
      dueDate: inv.dueDate,
      renewalDate: undefined,
      items: itemsByInvoice[String(inv.id)] || [],
      subtotal: Number(inv.subtotal || 0),
      taxRate: Number(inv.taxRate || 0),
      taxAmount: Number(inv.taxAmount || 0),
      totalAmount: Number(inv.totalAmount || 0),
      notes: inv.notes || undefined,
      status: inv.status,
      createdAt: inv.createdAt,
      updatedAt: inv.updatedAt
    }))
  },

  async getInvoice(id: string): Promise<Invoice | null> {
    await initializeCoreTables()
    const pool = await getPool()
    const [rows] = await pool.query(`SELECT id, invoice_number AS invoiceNumber, client_name AS clientName, client_email AS clientEmail, client_phone AS clientPhone, client_address AS clientAddress, issue_date AS issueDate, due_date AS dueDate, subtotal, tax_rate AS taxRate, tax_amount AS taxAmount, total_amount AS totalAmount, notes, status, created_at AS createdAt, updated_at AS updatedAt FROM invoices WHERE id = ? LIMIT 1`, [id])
    const inv = (rows as any[])[0]
    if (!inv) return null
    const [items] = await pool.query(`SELECT description, quantity, unit_price AS unitPrice, total_price AS totalPrice FROM invoice_items WHERE invoice_id = ? ORDER BY id ASC`, [inv.id])
    return {
      id: String(inv.id),
      invoiceNumber: inv.invoiceNumber,
      clientName: inv.clientName,
      clientEmail: inv.clientEmail || undefined,
      clientPhone: inv.clientPhone || undefined,
      clientAddress: inv.clientAddress || undefined,
      issueDate: inv.issueDate,
      dueDate: inv.dueDate,
      renewalDate: undefined,
      items: (items as any[]).map(it => ({ description: it.description, quantity: it.quantity, unitPrice: Number(it.unitPrice), totalPrice: Number(it.totalPrice) })),
      subtotal: Number(inv.subtotal || 0),
      taxRate: Number(inv.taxRate || 0),
      taxAmount: Number(inv.taxAmount || 0),
      totalAmount: Number(inv.totalAmount || 0),
      notes: inv.notes || undefined,
      status: inv.status,
      createdAt: inv.createdAt,
      updatedAt: inv.updatedAt
    }
  },

  async createInvoice(invoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>): Promise<Invoice> {
    await initializeCoreTables()
    const pool = await getPool()
    // Use seconds-based timestamp (10 digits) + random padding for uniqueness
    const id = Math.floor(Date.now() / 1000) + Math.floor(Math.random() * 100000)
    const now = new Date()
    await pool.execute(
      `INSERT INTO invoices (id, invoice_number, client_name, client_email, client_phone, client_address, issue_date, due_date, subtotal, tax_rate, tax_amount, total_amount, notes, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        invoice.invoiceNumber,
        invoice.clientName,
        invoice.clientEmail || null,
        invoice.clientPhone || null,
        invoice.clientAddress || null,
        invoice.issueDate,
        invoice.dueDate,
        invoice.subtotal || 0,
        invoice.taxRate || 0,
        invoice.taxAmount || 0,
        invoice.totalAmount || 0,
        invoice.notes || null,
        invoice.status,
        now,
        now
      ]
    )
    if (invoice.items && invoice.items.length) {
      for (const item of invoice.items) {
        await pool.execute(
          `INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, total_price) VALUES (?, ?, ?, ?, ?)`,
          [id, item.description, item.quantity, item.unitPrice, item.totalPrice]
        )
      }
    }
    return { ...invoice, id: String(id), createdAt: now.toISOString(), updatedAt: now.toISOString() }
  },

  async updateInvoice(id: string, updates: Partial<Invoice>): Promise<Invoice | null> {
    await initializeCoreTables()
    const pool = await getPool()
    // Items handling: if items present, replace items set
    if (updates.items) {
      await pool.execute(`DELETE FROM invoice_items WHERE invoice_id = ?`, [id])
      for (const item of updates.items) {
        await pool.execute(
          `INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, total_price) VALUES (?, ?, ?, ?, ?)`,
          [id, item.description, item.quantity, item.unitPrice, item.totalPrice]
        )
      }
    }
    const map: Record<string, string> = {
      invoiceNumber: 'invoice_number',
      clientName: 'client_name',
      clientEmail: 'client_email',
      clientPhone: 'client_phone',
      clientAddress: 'client_address',
      issueDate: 'issue_date',
      dueDate: 'due_date',
      subtotal: 'subtotal',
      taxRate: 'tax_rate',
      taxAmount: 'tax_amount',
      totalAmount: 'total_amount',
      notes: 'notes',
      status: 'status'
    }
    const fields: string[] = []
    const values: any[] = []
    Object.entries(updates).forEach(([k, v]) => {
      if (k === 'items') return
      if (v === undefined) return
      const col = map[k]
      if (col) {
        fields.push(`${col} = ?`)
        values.push(v)
      }
    })
    if (fields.length) {
      values.push(id)
      await pool.execute(`UPDATE invoices SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, values)
    }
    return await this.getInvoice(id)
  },

  async deleteInvoice(id: string): Promise<boolean> {
    await initializeCoreTables()
    const pool = await getPool()
    const [result] = await pool.execute(`DELETE FROM invoices WHERE id = ?`, [id])
    // @ts-ignore
    return result.affectedRows > 0
  },

  async generateInvoiceNumber(): Promise<string> {
    await initializeCoreTables()
    const pool = await getPool()
    const year = new Date().getFullYear()
    const month = String(new Date().getMonth() + 1).padStart(2, '0')
    const prefix = `INV-${year}${month}`
    const [rows] = await pool.query(`SELECT COUNT(*) AS cnt FROM invoices WHERE invoice_number LIKE CONCAT(?, '%')`, [prefix])
    const count = (rows as any[])[0]?.cnt || 0
    const nextNumber = Number(count) + 1
    return `${prefix}-${String(nextNumber).padStart(4, '0')}`
  }
}

// Initialize database - no demo data
export const initializeDatabase = () => {
  // Ensure MySQL tables exist
  initializeCoreTables().catch(err => console.error('DB init failed:', err))
}