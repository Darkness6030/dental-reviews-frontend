import { createBrowserRouter } from 'react-router-dom'
import App from './App'
import AspectsPage from './pages/AspectsPage'
import ComplaintPage from './pages/ComplaintPage'
import ContactPage from './pages/ContactPage'
import DoctorsPage from './pages/DoctorsPage'
import ExperiencePage from './pages/ExperiencePage'
import PlatformsPage from './pages/PlatformsPage'
import ReviewPage from './pages/ReviewPage'
import RewardsPage from './pages/RewardsPage'
import ServicesPage from './pages/ServicesPage'
import SourcePage from './pages/SourcePage'

export const router = createBrowserRouter([
    {
        path: '/',
        element: <App />,
        children: [
            { index: true, element: <ExperiencePage /> },
            { path: 'complaint', element: <ComplaintPage /> },
            { path: 'doctors', element: <DoctorsPage /> },
            { path: 'services', element: <ServicesPage /> },
            { path: 'aspects', element: <AspectsPage /> },
            { path: 'source', element: <SourcePage /> },
            { path: 'contact', element: <ContactPage /> },
            { path: 'review', element: <ReviewPage /> },
            { path: 'rewards', element: <RewardsPage /> },
            { path: 'platforms', element: <PlatformsPage /> },
        ]
    }
])
