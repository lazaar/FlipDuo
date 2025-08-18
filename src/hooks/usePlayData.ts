import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { 
    setDiamonds, 
    updateDiamonds, 
    decrementDiamond, 
    incrementDiamond,
    setBestScoreSimple,
    setBestScoreFlash, 
} from '../redux/play';
import { DiamondsBag } from '../data/playTypes';

export const usePlayData = () => {
    const dispatch = useDispatch();
    const { diamonds, bestScoreSimple, bestScoreFlash } = useSelector((state: RootState) => state.play);

    const updateDiamondsData = (diamondsData: DiamondsBag) => {
        dispatch(setDiamonds(diamondsData));
    };

    const updateDiamondsPartial = (partial: Partial<DiamondsBag>) => {
        dispatch(updateDiamonds(partial));
    };

    const decrementDiamondByKey = (key: keyof DiamondsBag) => {
        dispatch(decrementDiamond(key));
    };

    const incrementDiamondByKey = (key: keyof DiamondsBag, amount: number) => {
        dispatch(incrementDiamond({ key, amount }));
    };


    const setBestScoreSimpleData = (score: number) => {
        dispatch(setBestScoreSimple(score));
    };

    const setBestScoreFlashData = (score: number) => {
        dispatch(setBestScoreFlash(score));
    };



    return {
        diamonds,
        updateDiamondsData,
        updateDiamondsPartial,
        decrementDiamondByKey,
        incrementDiamondByKey,
        setBestScoreSimpleData,
        setBestScoreFlashData,
        bestScoreSimple,
        bestScoreFlash,
    };
};
