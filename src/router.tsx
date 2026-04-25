import { createBrowserRouter } from "react-router-dom"
import { App } from "./App"
import { AspectsPage } from "./pages/AspectsPage"
import { ComplaintPage } from "./pages/ComplaintPage"
import { ContactsPage } from "./pages/ContactsPage"
import { DoctorsPage } from "./pages/DoctorsPage"
import { ExperiencePage } from "./pages/ExperiencePage"
import { FeedbackPage } from "./pages/FeedbackPage"
import { PlatformsPage } from "./pages/PlatformsPage"
import { ReviewPage } from "./pages/ReviewPage"
import { RewardsPage } from "./pages/RewardsPage"
import { ServicesPage } from "./pages/ServicesPage"
import { SourcePage } from "./pages/SourcePage"

export const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        children: [
            { index: true, element: <FeedbackPage /> },
            { path: "complaint", element: <ComplaintPage /> },
            { path: "doctors", element: <DoctorsPage /> },
            { path: "services", element: <ServicesPage /> },
            { path: "aspects", element: <AspectsPage /> },
            { path: "source", element: <SourcePage /> },
            { path: "experience", element: <ExperiencePage /> },
            { path: "review", element: <ReviewPage /> },
            { path: "rewards", element: <RewardsPage /> },
            { path: "contacts", element: <ContactsPage /> },
            { path: "platforms", element: <PlatformsPage /> },
        ]
    }
])
