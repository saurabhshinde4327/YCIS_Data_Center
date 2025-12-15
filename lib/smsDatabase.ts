import mysql from 'mysql2/promise'

export interface SmsAdmin {
  id: string
  username: string
  email: string
  password: string
  name: string
  active: boolean
  createdAt: string
}

export interface SmsStudent {
  id: string
  name: string
  contactNo: string
  className: string
  fileName?: string
  uploadedAt: string
}

// Dedicated SMS portal database configuration
const smsDatabaseConfig = {
  host: process.env.SMS_DB_HOST || process.env.DB_HOST || '91.108.105.168',
  port: Number(process.env.SMS_DB_PORT || process.env.DB_PORT || 3306),
  user: process.env.SMS_DB_USER || process.env.DB_USER || 'root',
  password: process.env.SMS_DB_PASSWORD || process.env.DB_PASSWORD || 'Saurabh@2000',
  // Default to main DB if SMS DB not provided
  database: process.env.SMS_DB_NAME || process.env.DB_NAME || 'ycis_datacenter',
  waitForConnections: true,
  connectionLimit: Number(process.env.SMS_DB_CONN_LIMIT || 10),
  queueLimit: 0
}

let smsPool: mysql.Pool | null = null

const getSmsPool = async (): Promise<mysql.Pool> => {
  if (!smsPool) {
    smsPool = mysql.createPool(smsDatabaseConfig)
  }
  return smsPool
}

const ensureSmsTables = async () => {
  const pool = await getSmsPool()

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS sms_admins (
      id BIGINT PRIMARY KEY,
      username VARCHAR(100) NOT NULL UNIQUE,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      name VARCHAR(255) NOT NULL,
      active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Add email column if it does not exist (for legacy deployments)
  try {
    await pool.execute(`ALTER TABLE sms_admins ADD COLUMN email VARCHAR(255) NOT NULL UNIQUE AFTER username`)
  } catch (err) {
    // ignore if column already exists
  }
  try {
    await pool.execute(`ALTER TABLE sms_admins ADD COLUMN active BOOLEAN DEFAULT TRUE AFTER name`)
  } catch (err) {
    // ignore if column already exists
  }

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS sms_students (
      id BIGINT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      contact_no VARCHAR(50) NOT NULL,
      class_name VARCHAR(100) NOT NULL,
      file_name VARCHAR(255),
      uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_contact_no (contact_no),
      INDEX idx_class_name (class_name)
    )
  `)

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS sms_logs (
      id BIGINT PRIMARY KEY AUTO_INCREMENT,
      admin_id BIGINT NOT NULL,
      recipient_phone VARCHAR(50) NOT NULL,
      message TEXT NOT NULL,
      status VARCHAR(50) DEFAULT 'sent',
      message_id VARCHAR(255),
      delivery_status VARCHAR(50),
      delivery_timestamp TIMESTAMP NULL,
      provider_response TEXT,
      sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_admin_id (admin_id),
      INDEX idx_sent_at (sent_at),
      INDEX idx_message_id (message_id),
      INDEX idx_status (status)
    )
  `)

  // Add new columns if they don't exist (for existing deployments)
  try {
    await pool.execute(`ALTER TABLE sms_logs ADD COLUMN message_id VARCHAR(255) AFTER status`)
  } catch (err: any) {
    // ignore if column already exists
  }
  try {
    await pool.execute(`ALTER TABLE sms_logs ADD COLUMN delivery_status VARCHAR(50) AFTER message_id`)
  } catch (err: any) {
    // ignore if column already exists
  }
  try {
    await pool.execute(`ALTER TABLE sms_logs ADD COLUMN delivery_timestamp TIMESTAMP NULL AFTER delivery_status`)
  } catch (err: any) {
    // ignore if column already exists
  }
  try {
    await pool.execute(`ALTER TABLE sms_logs ADD COLUMN provider_response TEXT AFTER delivery_timestamp`)
  } catch (err: any) {
    // ignore if column already exists
  }
  try {
    await pool.execute(`ALTER TABLE sms_logs ADD INDEX idx_message_id (message_id)`)
  } catch (err: any) {
    // ignore if index already exists
  }
  try {
    await pool.execute(`ALTER TABLE sms_logs ADD INDEX idx_status (status)`)
  } catch (err: any) {
    // ignore if index already exists
  }

  // Create table for incoming SMS messages
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS sms_incoming (
      id BIGINT PRIMARY KEY AUTO_INCREMENT,
      from_number VARCHAR(50) NOT NULL,
      to_number VARCHAR(50) NOT NULL,
      message_body TEXT NOT NULL,
      message_keyword VARCHAR(50),
      inbound_message_id VARCHAR(255),
      received_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_from_number (from_number),
      INDEX idx_received_at (received_at)
    )
  `)
}

const maybeCreateDefaultAdmin = async () => {
  const pool = await getSmsPool()
  const username = process.env.SMS_ADMIN_USER || 'shindesaurabh0321@gmail.com'
  const email = process.env.SMS_ADMIN_EMAIL || username
  const password = process.env.SMS_ADMIN_PASSWORD || 'Saurabh@2000'
  const name = process.env.SMS_ADMIN_NAME || 'SMS Support Admin'
  const id = Math.floor(Date.now() / 1000) + Math.floor(Math.random() * 100000)

  // Skip seeding if an admin already exists with same username/email
  const [existing] = await pool.query(
    `SELECT id FROM sms_admins WHERE LOWER(username) = LOWER(?) OR LOWER(email) = LOWER(?) LIMIT 1`,
    [username, email]
  )
  if ((existing as any[])[0]) return

  try {
    await pool.execute(
      `INSERT INTO sms_admins (id, username, email, password, name, active) VALUES (?, ?, ?, ?, ?, TRUE)`,
      [id, username, email, password, name]
    )
  } catch (err: any) {
    // Ignore duplicate inserts triggered by concurrent init
    if (err?.code !== 'ER_DUP_ENTRY') {
      throw err
    }
  }
}

export const smsDb = {
  async getAdminByUsername(username: string): Promise<SmsAdmin | null> {
    await ensureSmsTables()
    await maybeCreateDefaultAdmin()
    const pool = await getSmsPool()
    const [rows] = await pool.query(
      `SELECT id, username, email, password, name, active, created_at AS createdAt FROM sms_admins WHERE LOWER(username) = LOWER(?) LIMIT 1`,
      [username]
    )
    const admin = (rows as any[])[0]
    if (!admin) return null
    return {
      id: String(admin.id),
      username: admin.username,
      email: admin.email,
      password: admin.password,
      name: admin.name,
      active: Boolean(admin.active),
      createdAt: admin.createdAt
    }
  },

  async getAdminByIdentifier(identifier: string): Promise<SmsAdmin | null> {
    await ensureSmsTables()
    await maybeCreateDefaultAdmin()
    const pool = await getSmsPool()
    const [rows] = await pool.query(
      `SELECT id, username, email, password, name, active, created_at AS createdAt FROM sms_admins WHERE LOWER(username) = LOWER(?) OR LOWER(email) = LOWER(?) LIMIT 1`,
      [identifier, identifier]
    )
    const admin = (rows as any[])[0]
    if (!admin) return null
    return {
      id: String(admin.id),
      username: admin.username,
      email: admin.email,
      password: admin.password,
      name: admin.name,
      active: Boolean(admin.active),
      createdAt: admin.createdAt
    }
  },

  async listAdmins(): Promise<SmsAdmin[]> {
    await ensureSmsTables()
    await maybeCreateDefaultAdmin()
    const pool = await getSmsPool()
    const [rows] = await pool.query(`
      SELECT id, username, email, password, name, active, created_at AS createdAt
      FROM sms_admins
      ORDER BY created_at DESC
    `)
    return (rows as any[]).map(r => ({
      id: String(r.id),
      username: r.username,
      email: r.email,
      password: r.password,
      name: r.name,
      active: Boolean(r.active),
      createdAt: r.createdAt
    }))
  },

  async createAdmin(data: { username: string; email: string; password: string; name: string; active?: boolean }): Promise<SmsAdmin> {
    await ensureSmsTables()
    await maybeCreateDefaultAdmin()
    const pool = await getSmsPool()
    const id = Math.floor(Date.now() / 1000) + Math.floor(Math.random() * 100000)
    await pool.execute(
      `INSERT INTO sms_admins (id, username, email, password, name, active) VALUES (?, ?, ?, ?, ?, ?)`,
      [id, data.username, data.email, data.password, data.name, data.active === false ? 0 : 1]
    )
    return {
      id: String(id),
      username: data.username,
      email: data.email,
      password: data.password,
      name: data.name,
      active: data.active !== false,
      createdAt: new Date().toISOString()
    }
  },

  async setAdminActive(id: string, active: boolean): Promise<boolean> {
    await ensureSmsTables()
    const pool = await getSmsPool()
    const [result] = await pool.execute(`UPDATE sms_admins SET active = ? WHERE id = ?`, [active ? 1 : 0, id])
    // @ts-ignore
    return result.affectedRows > 0
  },

  async saveStudents(
    rows: Array<{ name: string; contactNo: string; className: string; fileName?: string }>
  ): Promise<number> {
    await ensureSmsTables()
    const pool = await getSmsPool()
    let inserted = 0

    for (const student of rows) {
      const id = Math.floor(Date.now() / 1000) + Math.floor(Math.random() * 100000) + inserted
      await pool.execute(
        `INSERT INTO sms_students (id, name, contact_no, class_name, file_name) VALUES (?, ?, ?, ?, ?)`,
        [id, student.name, student.contactNo, student.className, student.fileName || null]
      )
      inserted += 1
    }

    return inserted
  },

  async getStudents(): Promise<SmsStudent[]> {
    await ensureSmsTables()
    const pool = await getSmsPool()
    const [rows] = await pool.query(`
      SELECT id, name, contact_no AS contactNo, class_name AS className, file_name AS fileName, uploaded_at AS uploadedAt
      FROM sms_students
      ORDER BY uploaded_at DESC, id DESC
    `)

    return (rows as any[]).map(r => ({
      id: String(r.id),
      name: r.name,
      contactNo: r.contactNo,
      className: r.className,
      fileName: r.fileName || undefined,
      uploadedAt: r.uploadedAt
    }))
  },

  async getAdminById(id: string): Promise<SmsAdmin | null> {
    await ensureSmsTables()
    const pool = await getSmsPool()
    const [rows] = await pool.query(
      `SELECT id, username, email, password, name, active, created_at AS createdAt FROM sms_admins WHERE id = ? LIMIT 1`,
      [id]
    )
    const admin = (rows as any[])[0]
    if (!admin) return null
    return {
      id: String(admin.id),
      username: admin.username,
      email: admin.email,
      password: admin.password,
      name: admin.name,
      active: Boolean(admin.active),
      createdAt: admin.createdAt
    }
  },

  async getSmsCountByAdmin(adminId: string): Promise<number> {
    await ensureSmsTables()
    const pool = await getSmsPool()
    const [rows] = await pool.query(
      `SELECT COUNT(*) as count FROM sms_logs WHERE admin_id = ?`,
      [adminId]
    )
    return (rows as any[])[0]?.count || 0
  },

  async logSms(adminId: string, recipientPhone: string, message: string, status: string = 'sent', messageId?: string): Promise<void> {
    await ensureSmsTables()
    const pool = await getSmsPool()
    await pool.execute(
      `INSERT INTO sms_logs (admin_id, recipient_phone, message, status, message_id) VALUES (?, ?, ?, ?, ?)`,
      [adminId, recipientPhone, message, status, messageId || null]
    )
  },

  async updateSmsDeliveryStatus(messageId: string, deliveryStatus: string, providerResponse?: string): Promise<boolean> {
    await ensureSmsTables()
    const pool = await getSmsPool()
    const [result] = await pool.execute(
      `UPDATE sms_logs SET delivery_status = ?, delivery_timestamp = CURRENT_TIMESTAMP, provider_response = ? WHERE message_id = ?`,
      [deliveryStatus, providerResponse || null, messageId]
    )
    // @ts-ignore
    return result.affectedRows > 0
  },

  async logIncomingSms(fromNumber: string, toNumber: string, messageBody: string, messageKeyword?: string, inboundMessageId?: string): Promise<void> {
    await ensureSmsTables()
    const pool = await getSmsPool()
    await pool.execute(
      `INSERT INTO sms_incoming (from_number, to_number, message_body, message_keyword, inbound_message_id) VALUES (?, ?, ?, ?, ?)`,
      [fromNumber, toNumber, messageBody, messageKeyword || null, inboundMessageId || null]
    )
  },

  async deleteStudent(id: string): Promise<boolean> {
    await ensureSmsTables()
    const pool = await getSmsPool()
    const [result] = await pool.execute(`DELETE FROM sms_students WHERE id = ?`, [id])
    // @ts-ignore
    return result.affectedRows > 0
  }
}

export const initializeSmsDatabase = async () => {
  await ensureSmsTables()
  await maybeCreateDefaultAdmin()
}

// Fire-and-forget init to ensure tables exist in dev
initializeSmsDatabase().catch(err => console.error('SMS DB init failed:', err))

