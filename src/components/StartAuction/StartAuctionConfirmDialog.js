import React, {Component} from 'react';
import {startAuctionAndBid, newBid, getRegistrarAddress} from '../../lib/ensService';
import {getEstimateGas, getTransactionFee} from '../../lib/dAppService';
import Dialog, {DialogActions, DialogContent} from 'material-ui/Dialog';
import List from 'material-ui/List';
import Divider from 'material-ui/Divider';
import Button from 'material-ui/Button';
import './StartAuctionConfirmDialog.css';

const ConfirmListItem = (props) => {
  const specialName = ['From', 'To'];
  const classes = specialName.includes(props.name) ? 'address' : '';

  return (
    <div className="StartAuctionConfirmDialog-list-item">
      <p>{props.name}:</p>
      <p className={classes}>{props.info}</p>
      <Divider/>
    </div>
  );
}

export class StartAuctionConfirmDialog extends Component {

  payload() {
    const { searchResult: { searchName }, privateKey, state } = this.props;
    const {ethBid, ethMask, secret, gas} = this.props.inputResult;
    
    return (state === 'Open') 
      ? startAuctionAndBid(searchName, ethBid, ethMask, secret, privateKey, gas)
      : newBid(searchName, ethBid, ethMask, secret, privateKey, gas);
  }

  getFeeString() {
    const {gas} = this.props.inputResult;
    const estimateGas = getEstimateGas(this.payload());
    const transactionFee = getTransactionFee(gas, estimateGas);

    return `${gas} Gwei * ${estimateGas} = ${transactionFee} ETH`;
  }

  getETHString() {
    const {ethBid, ethMask} = this.props.inputResult;
    const ethTotal = parseFloat(ethBid, 10) + parseFloat(ethMask, 10);
    return (parseFloat(ethMask) > 0) ? 
      `${ethBid}(bid) + ${ethMask}(mask) = ${ethTotal} ETH` : `${ethBid} ETH`;
  }

  formInfo = () => ({
    From: `${this.props.address}`,
    To: getRegistrarAddress(),
    Fee: this.getFeeString(),
    ETH: this.getETHString(),
  })    

  inputResultList() {
    const formInfo = this.formInfo();
    return (
      <List>
        {Object
          .keys(formInfo)
          .map((key, index) => 
            <ConfirmListItem key={`input-${index}`} name={key} info={formInfo[key]}/>)}
      </List>
    );
  }
    
  render() {
    const {open, handleClose} = this.props;    
    const inputResultList = this.inputResultList();

    return (
      <Dialog open={open} onRequestClose={handleClose}>
        <div className="StartAuctionConfirmDialog">
          <h4 className="StartAuctionConfirmDialog-title">Confirm Auction Bid Information</h4>
          <DialogContent>
            {inputResultList}
          </DialogContent>
          <div className="StartAuctionConfirmDialog-action-block">
            <DialogActions>
              <Button raised onClick={handleClose}>Cancel</Button>
              <Button raised
                className="KeystoreUploader-button" 
                onClick={() => this.props.handleAuctionFormSubmit(this.props.inputResult)}>
                Submit
              </Button>
            </DialogActions>
          </div>
        </div>
      </Dialog>
    );
  }
};