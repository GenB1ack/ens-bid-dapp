import React, {Component} from 'react';
import TextField from 'material-ui/TextField';
import Button from 'material-ui/Button';
import {momentFromNow} from '../../lib/util';
import {sealedBids} from '../../lib/ensService';
import {RevealAuctionConfirmDialog} from './RevealAuctionConfirmDialog';
import './RevealAuctionForm.css';

const FormComponent = (props) => (
  <div className="RevealAuctionForm">
    <div className="RevealAuctionForm-field">
      <TextField
        id="email"
        name="email"
        label="Email"
        value={props.email}
        onChange={props.handleInputChange}
        margin="normal"
        placeholder="youremail@example.com"
        helperText="The bid information will send to this email"
      />

      <TextField
        id="ethBid"
        name="ethBid"
        label="ETH"
        value={props.ethBid}
        onChange={props.handleInputChange}
        margin="normal"
        placeholder="0.01"
        helperText="Bid amount"
      />
      <TextField
        id="secret"
        name="secret"
        label="Secret"
        value={props.secret}
        onChange={props.handleInputChange}
        margin="normal"
        placeholder="passphrase"
        helperText="Please protect your bid with random numbers and characters"
      />
      <TextField
        id="gas"
        name="gas"
        label="Gas Price"
        type="number"
        value={props.gas}
        onChange={props.handleInputChange}
        margin="normal"
        helperText="Recommend use 21 Gwei"
      />
    </div>
    <div className="RevealAuctionForm-submit">
      <Button
        raised
        label="Dialog"
        color="primary"
        onClick={props.handleOpen}
      >
        Confirm Submit
      </Button>
    </div>
  </div>
);

export class RevealAuctionForm extends Component {
  state = {
    open: false
  };

  handleOpen = () => {
    if (this.props.address && this.props.privateKey) {
      this.props.handleWarningMessageOpen("Should login first");
    }

    const checkValue = sealedBids(
      this.props.searchResult.searchName,
      this.props.ethBid,
      this.props.secret,
      this.props.privateKey
    );
    if (checkValue === '0x0000000000000000000000000000000000000000') {
      this.props.handleWarningMessageOpen("Invalid sealed bids");
    }

    this.setState({open: true});
  }

  handleClose = () => {
    this.setState({open: false});
  }

  render() {
    return (
      <div>
        <h2>{this.props.searchResult.searchName}.eth</h2>
        <div>
          <div>
            <p>Reveal Auction On</p>
            <div>{this.props.unsealStartsAt.toString()}</div>
            <div>{momentFromNow(this.props.unsealStartsAt).toString()}</div>
          </div>
          <div>
            <p>Finalize Auction On</p>
            <div>{this.props.registratesAt.toString()}</div>
            <div>{momentFromNow(this.props.registratesAt).toString()}</div>
          </div>
        </div>

        <FormComponent 
          {...this.props}
          handleOpen={this.handleOpen}
        />

        {
          (this.state.open && this.props.address && this.props.privateKey) &&
          <RevealAuctionConfirmDialog
            {...this.props}
            open={this.state.open}
            handleClose={this.handleClose}
          />
        }
      </div>
    );
  }
};
