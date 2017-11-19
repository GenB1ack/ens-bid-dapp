import React, {Component} from 'react';
import TextField from 'material-ui/TextField';
import Button from 'material-ui/Button';
import {validateRevealAuctionBid} from '../../lib/ensService';
import {TimeDuration} from './TimeDuration';
import {RevealAuctionConfirmDialog} from './RevealAuctionConfirmDialog';
import {RevealAuctionJsonDialog} from './RevealAuctionJsonDialog';
import './RevealAuctionForm.css';


const EthBidTextField = (props) => (
  <TextField
    error={props.error}
    id="ethBid"
    name="ethBid"
    label="ETH"
    value={props.value}
    onChange={props.onChange}
    margin="normal"
    placeholder="0.01"
    helperText={props.error ? props.errMsg : 'Bid amount'}
  />
);

const SecretTextField = (props) => (
  <TextField
    error={props.error}
    id="secret"
    name="secret"
    label="Secret"
    value={props.value}
    onChange={props.onChange}
    margin="normal"
    placeholder="pass phrase"
    helperText={props.error ? props.errMsg :"Please protect your bid with random numbers and characters"}
  />
);

const GasTextField = (props) => (
  <TextField
    error={props.error}
    id="gas"
    name="gas"
    label="Gas Price (Gwei)"
    type="number"
    value={props.value}
    onChange={props.onChange}
    margin="normal"
    helperText={props.error ? props.errMsg : "Recommend use 21 Gwei"}
  />
);

const ConfirmFormSubmit = (props) => {
  const disabled = props.disabled;
  const classes = !disabled ? 'KeystoreUploader-button': '';

  return (
    <div className="RevealAuctionForm-submit">
      <Button
        className={classes}
        disabled={disabled}
        raised
        label="Dialog"
        onClick={props.onClick} >
        Confirm Submit
      </Button>
    </div>
  );
};

const ImportJsonButton = (props) => {
  return (
    <div className="RevealAuctionForm-importJson">
      <Button
        raised
        label="ImportJsonDialog"
        onClick={props.onClick} >
        Import JSON
      </Button>
    </div>
  )
}

const FormFields = (props) => (
  <div className="RevealAuctionForm-field">
    {/* <EmailTextField
      value={props.email}
      onChange={props.handleInputChange}
    /> */}
    <EthBidTextField
      error={props.ethBidErr}
      errMsg={props.ethBidErrMsg}
      value={props.ethBid}
      onChange={props.handleInputChange}
    />
    <SecretTextField
      error={props.secretErr}
      errMsg={props.secretErrMsg}
      value={props.secret}
      onChange={props.handleInputChange}
    />
    <GasTextField
      error={props.gasErr}
      errMsg={props.gasErrMsg}
      value={props.gas}
      onChange={props.handleInputChange}
    />
  </div>
);

export class RevealAuctionForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      email: '',
      ethBid: '0.01',
      ethBidErr: false,
      ethBidErrMsg: '',
      secret: '0',
      secretErr: false,
      secretErrMsg: '',
      gas: '21',
      gasErr: false,
      gasErrMsg: '',
      importDialogOpen: false,
      revealJson: '',
      revealJsonErr: false,
      revealJsonErrMsg: '',
    }
    this.handleOpen = this.handleOpen.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.checkEthBid = this.checkEthBid.bind(this);
    this.checkSecret = this.checkSecret.bind(this);
    this.checkGas = this.checkGas.bind(this);
    this.submitDisabled = this.submitDisabled.bind(this);
    this.inputResult = this.inputResult.bind(this);
    this.handleImportDialogOpen = this.handleImportDialogOpen.bind(this);
    this.handleImportDialogClose = this.handleImportDialogClose.bind(this);
    this.handleParseImportJson = this.handleParseImportJson.bind(this);
  }

  handleOpen = () => {
    if (!(this.props.address && this.props.privateKey)) {
      this.props.handleWarningMessageOpen("Should login first");
      return
    }

    const validateObj = validateRevealAuctionBid(
      this.props.searchResult.searchName,
      this.state.ethBid, this.state.secret, this.props.privateKey
    );
    if (!validateObj.validate) {
      this.props.handleMessageOpen(validateObj.err);
      return
    }

    this.setState({open: true});
  }

  handleClose = () => {
    this.setState({open: false});
  }

  handleInputChange(event) {
    const {name, value} = event.target;
    this.setState({ [name]: value });

    switch (name) {
      case 'ethBid':
        this.checkEthBid(value);
        break;
      case 'secret':
        this.checkSecret(value);
        break;
      case 'gas':
        this.checkGas(value);
        break;
      default:
    }
  }

  checkEthBid = (v) => {

    // validate input only number
    const reg = /^[+-]?\d+(\.\d+)?$/;
    if (!reg.test(v)) {
      this.setState({
        ethBidErr: true,
        ethBidErrMsg: 'Bid amount: Please input a valid number'
      })
      return;
    }

    // validate input should not be zero
    if (parseFloat(v, 10) === 0) {
      this.setState({
        ethBidErr: true,
        ethBidErrMsg: 'Bid amount: Please input a non-zero number'
      });
      return;
    }

    if (parseFloat(v, 10) < 0.01) {
      this.setState({
        ethBidErr: true,
        ethBidErrMsg: 'Bid amount: Minimum bid must at least 0.01'
      });
      return;
    }

    this.setState({
      ethBidErr: false,
      ethBidErrMsg: ''
    })
  }

  checkSecret = (v) => {
    // validate value should present
    if (v === '') {
      this.setState({
        secretErr: true,
        secretErrMsg: 'Please input random numbers and characters.'
      })
      return;
    }

    this.setState({
      secretErr: false,
      secretErrMsg: ''
    });
  }

  checkGas = (v) => {
    // validate value should present
    if (v === '') {
      this.setState({
        gasErr: true,
        gasErrMsg: 'Please input a number.'
      });
      return;
    }

    // validate should greater than one
    if (parseFloat(v, 10) <= 1) {
      this.setState({
        gasErr: true,
        gasErrMsg: 'Please input a number large than one'
      })
      return;
    }

    this.setState({
      gasErr: false,
      gasErrMsg: ''
    })
  }

  submitDisabled = () => {
    const {ethBidErr, secretErr, gasErr} = this.state;
    return ethBidErr || secretErr || gasErr;
  }

  inputResult = () => ({
    email: this.state.email,
    ethBid: this.state.ethBid,
    secret: this.state.secret,
    gas: this.state.gas
  })

  handleImportDialogOpen = () => {
    this.setState({importDialogOpen: true});
  }

  handleImportDialogClose = () => {
    this.setState({importDialogOpen: false});
  }

  handleParseImportJson = () => {
    try {
      const revealJsonObj = JSON.parse(this.state.revealJson);
      if (revealJsonObj.name !== this.props.searchResult.searchName) {
        this.setState({revealJsonErr: true, revealJsonErrMsg: "Reveal name not match."});
        return;
      }
      if (revealJsonObj.address !== this.props.address) {
        this.setState({revealJsonErr: true, revealJsonErrMsg: "Reveal address not match."});
        return;
      }
      this.setState({
        ethBid: revealJsonObj.value, 
        secret: revealJsonObj.secret,
        revealJson: '',
        revealJsonErr: false,
        revealJsonErrMsg: '',
      });
      this.handleImportDialogClose();
    } catch (e) {
      this.setState({revealJsonErr: true, revealJsonErrMsg: "Not a valid JSON format."});
    }
  }

  render() {
    const domainName = <h2>{this.props.searchResult.searchName}.eth</h2>;
    const timeDuration = <TimeDuration {...this.props} />;
    const revealAuctionConfirmDialog = 
      (this.state.open && this.props.address && this.props.privateKey) &&
        <RevealAuctionConfirmDialog
          {...this.props}
          inputResult={this.inputResult()}
          open={this.state.open}
          handleClose={this.handleClose}
        />;

    const importJsonButton = 
      <ImportJsonButton onClick={this.handleImportDialogOpen}/>;

    const revealAuctionJsonDialog = this.state.importDialogOpen &&
      <RevealAuctionJsonDialog
        {...this.state}
        handleInputChange={this.handleInputChange}
        handleParseImportJson={this.handleParseImportJson}
        handleImportDialogClose={this.handleImportDialogClose}
      />

    const confirmSubmitButton = 
      <ConfirmFormSubmit
        onClick={this.handleOpen}
        disabled={this.submitDisabled()}
      />;
      
    return (
      <div className='RevealAuctionForm'>
        {domainName}
        {timeDuration}
        <FormFields 
          {...this.props}
          {...this.state}
          handleInputChange={this.handleInputChange}
        />
        <div className="RevealAuctionForm-buttons">
          {importJsonButton}
          {confirmSubmitButton}
        </div>
        {revealAuctionConfirmDialog}
        {revealAuctionJsonDialog}
      </div>
    );
  }
};
