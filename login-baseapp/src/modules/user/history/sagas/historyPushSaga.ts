// tslint:disable-next-line
import { put, select } from 'redux-saga/effects';
import { defaultStorageLimit } from '../../../../api';
import { getTimezone, localeDate } from '../../../../helpers';
import { HistoryPush, pushHistoryFinish } from '../actions';
import { selectHistory } from '../selectors';
import { PrivateTrade, PrivateTradeEvent } from '../types';

export function* historyPushSaga(action: HistoryPush) {
    const tradeEventToTrade = (tradeEvent: PrivateTradeEvent): PrivateTrade => {
        const { id, at, market, price, total, amount } = tradeEvent;
        return {
            id,
            price,
            total,
            amount,
            market,
            created_at: localeDate(at, 'fullDate', getTimezone()),
        };
    };

    const actualList = yield select(selectHistory);
    const updatedTrades = [...[tradeEventToTrade(action.payload)], ...actualList].slice(0, defaultStorageLimit());

    yield put(pushHistoryFinish(updatedTrades));
}
