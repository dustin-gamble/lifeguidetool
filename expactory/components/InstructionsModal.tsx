
import React from 'react';
import Modal from './Modal';

interface InstructionsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const InstructionsModal: React.FC<InstructionsModalProps> = ({ isOpen, onClose }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <h2 className="text-2xl font-fredoka text-cyan-800 mb-4">Welcome to Expactory!</h2>
            <div className="text-gray-700 space-y-3">
                <p><strong>Your Goal:</strong> Expand your island and unlock new technologies.</p>
                <p><strong>Step 1:</strong> Build <strong>Miners ⛏️</strong> on Forest (🌲) or Rocky (⛰️) tiles to gather resources.</p>
                <p><strong>Step 2:</strong> When your storage is full, build <strong>Storage 📦</strong> to increase your capacity.</p>
                <p><strong>Step 3:</strong> At the end of each day (progress bar at the top), your island will automatically expand with a new land tile.</p>
                <p><strong>Step 4:</strong> Build <strong>Research Stations 🔬</strong> to earn points, then open the <strong>Research</strong> panel to unlock powerful upgrades!</p>
            </div>
            <button onClick={onClose} className="mt-6 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg w-full">Let's Go!</button>
        </Modal>
    );
};

export default InstructionsModal;
