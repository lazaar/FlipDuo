import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setDate } from '../../redux/game';
import { GiftModal } from '../GiftModal';

interface RootState {
  game: {
    lastDate: string | null;
  };
}

const GiftDialog: React.FC = () => {
  const dispatch = useDispatch();
  const [showGiftModal, setShowGiftModal] = useState<boolean>(false);
  const lastDate = useSelector((state: RootState) => state.game.lastDate);

  useEffect(() => {
    if (!lastDate) {
      dispatch(setDate());
      return;
    }

    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    if (currentDate.getTime() > new Date(lastDate).getTime()) {
      setShowGiftModal(true);
      dispatch(setDate());
    }
  }, [lastDate, dispatch]);

  const handleCloseGiftModal = () => {
    setShowGiftModal(false);
  };

  return (
    <GiftModal 
      isOpen={showGiftModal} 
      onClose={handleCloseGiftModal} 
    />
  );
};

export default GiftDialog;
