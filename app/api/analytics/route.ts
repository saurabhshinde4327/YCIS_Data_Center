import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const ANALYTICS_FILE = path.join(process.cwd(), 'data', 'analytics.json')

interface AnalyticsData {
  totalVisits: number
  uniqueVisitors: Set<string>
  dailyVisits: { [date: string]: number }
  lastUpdated: string
}

// Initialize analytics file if it doesn't exist
const initAnalytics = (): AnalyticsData => {
  try {
    const dataDir = path.join(process.cwd(), 'data')
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }

    if (!fs.existsSync(ANALYTICS_FILE)) {
      const initialData = {
        totalVisits: 0,
        uniqueVisitors: [],
        dailyVisits: {},
        lastUpdated: new Date().toISOString()
      }
      fs.writeFileSync(ANALYTICS_FILE, JSON.stringify(initialData, null, 2))
      return {
        totalVisits: 0,
        uniqueVisitors: new Set(),
        dailyVisits: {},
        lastUpdated: new Date().toISOString()
      }
    }

    const data = JSON.parse(fs.readFileSync(ANALYTICS_FILE, 'utf-8'))
    return {
      totalVisits: data.totalVisits || 0,
      uniqueVisitors: new Set(data.uniqueVisitors || []),
      dailyVisits: data.dailyVisits || {},
      lastUpdated: data.lastUpdated || new Date().toISOString()
    }
  } catch (error) {
    console.error('Error initializing analytics:', error)
    return {
      totalVisits: 0,
      uniqueVisitors: new Set(),
      dailyVisits: {},
      lastUpdated: new Date().toISOString()
    }
  }
}

const saveAnalytics = (data: AnalyticsData) => {
  try {
    const saveData = {
      totalVisits: data.totalVisits,
      uniqueVisitors: Array.from(data.uniqueVisitors),
      dailyVisits: data.dailyVisits,
      lastUpdated: new Date().toISOString()
    }
    fs.writeFileSync(ANALYTICS_FILE, JSON.stringify(saveData, null, 2))
  } catch (error) {
    console.error('Error saving analytics:', error)
  }
}

// GET - Retrieve analytics data
export async function GET() {
  try {
    const analytics = initAnalytics()
    const today = new Date().toISOString().split('T')[0]
    
    return NextResponse.json({
      success: true,
      totalVisits: analytics.totalVisits,
      todayVisits: analytics.dailyVisits[today] || 0,
      uniqueVisitors: analytics.uniqueVisitors.size
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}

// POST - Record a visit
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { visitorId } = body

    const analytics = initAnalytics()
    const today = new Date().toISOString().split('T')[0]

    // Increment total visits
    analytics.totalVisits += 1

    // Track unique visitors
    if (visitorId) {
      analytics.uniqueVisitors.add(visitorId)
    }

    // Track daily visits
    if (!analytics.dailyVisits[today]) {
      analytics.dailyVisits[today] = 0
    }
    analytics.dailyVisits[today] += 1

    // Clean up old daily data (keep only last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    Object.keys(analytics.dailyVisits).forEach(date => {
      if (new Date(date) < thirtyDaysAgo) {
        delete analytics.dailyVisits[date]
      }
    })

    saveAnalytics(analytics)

    return NextResponse.json({
      success: true,
      totalVisits: analytics.totalVisits,
      todayVisits: analytics.dailyVisits[today]
    })
  } catch (error) {
    console.error('Error recording visit:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to record visit' },
      { status: 500 }
    )
  }
}

