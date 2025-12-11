
import React from 'react';
import Modal from './Modal';

interface InfoModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-md">
            <h2 className="text-2xl font-fredoka text-cyan-800 mb-4">About Expactory</h2>
            <div className="text-gray-700 space-y-3 text-center">
                <p>Start with a tiny island and grow it into a sprawling, automated industrial complex. Gather resources, expand your land, and research new technologies to unlock more powerful buildings and abilities.</p>
                <p>This is an incremental game about automation and discovery. There is no end, only endless expansion!</p>
                <p className="font-bold">Version: 1.0 (React)</p>
            </div>
            <button onClick={onClose} className="mt-6 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg w-full">Close</button>
        </Modal>
    );
};

export default InfoModal;
