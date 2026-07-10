// citation: https://youtu.be/JVCU2qsGvOs?si=iVz1N7_lr78bsDkh

export const Header = () => {
    return (
        <Header className="flex justify-between items-center bg-white shadow px-6 py-3">
            <h1 className="text-lg font-semibold">Dashboard</h1>
            <div className = "flex items-center gap-4">
                <span className="text-gray-700"> User Name</span>
            </div>
        </Header>
    )
}