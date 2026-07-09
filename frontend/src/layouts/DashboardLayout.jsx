// citation: https://youtu.be/JVCU2qsGvOs?si=iVz1N7_lr78bsDkh
import { Outlet } from "react-router-dom"
import { Header } from "../components/common/Header"
import { Siderbar } from "../components/common/Sidebar"
export const DashboardLayout = () => {
    return (
        <div className="flex">
            <Siderbar/>
            <div className="flex-1 min-h-screen bg-gray-100">
                <Header/>
                <main className="p-6">
                    <Outlet/>
                </main>
            </div>
        </div>
    )
}