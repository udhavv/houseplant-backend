import cron from 'node-cron'
import { prisma } from '../prisma.js'
import { sendWiltingEmail } from '../utils/email.js'

// Runs every 6 hours: "0 */6 * * *"
// For testing, run every minute: "* * * * *"
cron.schedule('0 */6 * * *', async () => {
  console.log('🌱 Running plant health degradation...')
  
  try {
    // Get all alive plants
    const plants = await prisma.plant.findMany({
      where: { isAlive: true },
      include: { user: true }
    })

    for (const plant of plants) {
      const hoursSinceWatered = (Date.now() - new Date(plant.lastWateredAt).getTime()) / (1000 * 60 * 60)
      
      // If not watered in 6+ hours, health drops
      if (hoursSinceWatered > 6) {
        const healthDrop = Math.floor(hoursSinceWatered / 6) * 10 // Drops 10 per 6 hours
        const newHealth = Math.max(0, plant.health - healthDrop)
        
        await prisma.plant.update({
          where: { id: plant.id },
          data: { 
            health: newHealth,
            isAlive: newHealth > 0
          }
        })

        // Send warning email if health < 30% and still alive
        if (newHealth < 30 && newHealth > 0) {
          await sendWiltingEmail(plant.user.email, plant.name)
        }

        // If dead, log it
        if (newHealth === 0) {
          console.log(`💀 Plant "${plant.name}" (ID: ${plant.id}) has died.`)
        }
      }
    }
  } catch (error) {
    console.error('Cron job failed:', error)
  }
})