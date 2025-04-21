import { ChatWidget } from '@/components/dashboard/customer/ChatbotWidget'
import { RecommendationsWidget } from '@/components/dashboard/customer/RecommendationsWidget'
import { AccountWidget } from '@/components/dashboard/customer/AccountWidget'

export function CustomerDashboard() {
  return (
    <div className="space-y-8">
      <AccountWidget />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <RecommendationsWidget />
        <ChatWidget />
      </div>
    </div>
  )
}