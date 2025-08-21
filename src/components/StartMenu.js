const StartMenu = ({ onStart }) => {
    return (
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-xl p-8 flex flex-col items-center text-center">
        <h2 className="text-4xl font-extrabold text-gray-800 mb-2">Doodle Jump</h2>
        <p className="text-gray-600 mb-6">
          Use the left and right arrow keys or 'A' and 'D' to move.
        </p>
        <button
          onClick={onStart}
          className="mt-4 px-8 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-full transition duration-300 transform hover:scale-105 shadow-lg"
        >
          Start Game
        </button>
      </div>
    );
  };

export default StartMenu;