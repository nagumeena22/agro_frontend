export default function Footer() {
    return (
        <footer className="bg-gray-800 text-gray-300 py-6 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
                <div className="mb-4 md:mb-0">
                    <span className="text-lg font-bold text-white">LakshmiAgro</span>
                    <p className="text-sm">Empowering Farmers with Technology</p>
                </div>
                <div className="text-sm">
                    &copy; {new Date().getFullYear()} LakshmiAgro. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
