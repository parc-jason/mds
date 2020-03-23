/* eslint-disable */
import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { Divider } from "antd";
import PropTypes from "prop-types";
import { fetchPermits } from "@common/actionCreators/permitActionCreator";
import { fetchMineRecordById } from "@common/actionCreators/mineActionCreator";
import { openModal, closeModal } from "@common/actions/modalActions";
import { getPermits } from "@common/reducers/permitReducer";
import { getBonds, getBondTotals } from "@common/selectors/securitiesSelectors";
import {
  getBondTypeOptionsHash,
  getBondStatusOptionsHash,
} from "@common/selectors/staticContentSelectors";
import {
  fetchMineBonds,
  createBond,
  updateBond,
} from "@common/actionCreators/securitiesActionCreator";
import { getMineGuid } from "@common/selectors/mineSelectors";
import CustomPropTypes from "@/customPropTypes";
import MineBondTable from "@/components/mine/Securities/MineBondTable";
import MineDashboardContentCard from "@/components/mine/MineDashboardContentCard";
import { modalConfig } from "@/components/modalContent/config";
import { formatMoney } from "@common/utils/helpers";
/**
 * @class  MineSecurityInfo - contains all information relating to bonds and securities
 */

const propTypes = {
  match: PropTypes.shape({
    params: {
      id: PropTypes.string,
    },
  }).isRequired,
  mines: PropTypes.arrayOf(CustomPropTypes.mine).isRequired,
  mineGuid: PropTypes.string.isRequired,
  permits: PropTypes.arrayOf(CustomPropTypes.permit),
  openModal: PropTypes.func.isRequired,
  history: PropTypes.shape({ push: PropTypes.func }).isRequired,
  closeModal: PropTypes.func.isRequired,
  fetchPermits: PropTypes.func.isRequired,
  fetchMineBonds: PropTypes.func.isRequired,
  createBond: PropTypes.func.isRequired,
  updateBond: PropTypes.func.isRequired,
  fetchMineRecordById: PropTypes.func.isRequired,
  bondTotals: PropTypes.objectOf(PropTypes.number).isRequired,
  bondStatusOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
  bondTypeOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
};

const defaultProps = {
  partyRelationships: [],
  permits: [],
};

export class MineSecurityInfo extends Component {
  state = {
    expandedRowKeys: [],
    isLoaded: false,
  };

  componentWillMount = () => {
    const { id } = this.props.match.params;
    this.props.fetchPermits(id).then(() => {
      this.props.fetchMineBonds(id).then(() => {
        this.setState({ isLoaded: true });
      });
    });
  };

  openAddBondModal = (event, permitGuid) => {
    event.preventDefault();
    this.props.openModal({
      props: {
        title: "Add Bond",
        onSubmit: this.addBondToPermit,
        permitGuid,
      },
      width: "50vw",
      content: modalConfig.ADD_BOND_MODAL,
    });
  };

  openEditBondModal = (event, bond) => {
    event.preventDefault();
    this.props.openModal({
      props: {
        title: `Edit Bond ${bond.bond_id}`,
        onSubmit: this.editBond,
        editBond: true,
        bond: bond,
      },
      width: "50vw",
      content: modalConfig.ADD_BOND_MODAL,
    });
  };

  openViewBondModal = (event, bond) => {
    event.preventDefault();
    this.props.openModal({
      props: {
        title: `View Bond ${bond.bond_id}`,
        bond: bond,
      },
      width: "50vw",
      content: modalConfig.VIEW_BOND_MODAL,
    });
  };

  editBond = (values, bondGuid) => {
    const payload = values;
    // payload expects the basic bond object without the following:
    delete payload.permit_guid;
    delete payload.bond_id;
    delete payload.bond_guid;
    delete payload.payer;
    this.props.updateBond(payload, bondGuid).then(() => {
      this.props.fetchMineBonds(this.props.mineGuid).then(() => {
        this.props.closeModal();
        this.setState({ isLoaded: true });
      });
    });
  };

  releaseOrConfiscateBond = (code, bondGuid, bond) => {
    // if bond is confiscated, convert to bond type to Cash
    const payload = {
      ...bond,
      bond_status_code: code,
      bond_type_code: code === "CON" ? "CAS" : bond.bond_type_code,
    };
    this.editBond(payload, bond.bond_guid);
  };

  addBondToPermit = (values, permitGuid) => {
    const payload = {
      bond: {
        bond_status_code: "ACT",
        ...values,
      },
      permit_guid: permitGuid,
    };

    this.props.createBond(payload).then(() => {
      this.props.fetchMineBonds(this.props.mineGuid).then(() => {
        this.props.closeModal();
        this.setState({ isLoaded: true });
      });
    });
  };

  onExpand = (expanded, record) =>
    this.setState((prevState) => {
      const expandedRowKeys = expanded
        ? prevState.expandedRowKeys.concat(record.key)
        : prevState.expandedRowKeys.filter((key) => {
            key !== record.key;
          });
      return { expandedRowKeys };
    });

  render() {
    return (
      <div className="tab__content">
        <div>
          <h2>Securities</h2>
          <Divider />
          <div className="dashboard--cards">
            <MineDashboardContentCard
              title="Total Amount Held"
              content={formatMoney(this.props.bondTotals.amountHeld)}
            />
            <MineDashboardContentCard title="Total Bonds" content={this.props.bondTotals.count} />
          </div>
          <br />
          <MineBondTable
            isLoaded={this.state.isLoaded}
            permits={this.props.permits}
            expandedRowKeys={this.state.expandedRowKeys}
            onExpand={this.onExpand}
            openAddBondModal={this.openAddBondModal}
            bonds={this.props.bonds}
            releaseOrConfiscateBond={this.releaseOrConfiscateBond}
            bondStatusOptionsHash={this.props.bondStatusOptionsHash}
            bondTypeOptionsHash={this.props.bondTypeOptionsHash}
            openViewBondModal={this.openViewBondModal}
            openEditBondModal={this.openEditBondModal}
          />
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  permits: getPermits(state),
  mineGuid: getMineGuid(state),
  bonds: getBonds(state),
  bondTotals: getBondTotals(state),
  bondStatusOptionsHash: getBondStatusOptionsHash(state),
  bondTypeOptionsHash: getBondTypeOptionsHash(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchPermits,
      fetchMineRecordById,
      openModal,
      closeModal,
      fetchMineBonds,
      createBond,
      updateBond,
    },
    dispatch
  );

MineSecurityInfo.propTypes = propTypes;
MineSecurityInfo.defaultProps = defaultProps;

export default connect(mapStateToProps, mapDispatchToProps)(MineSecurityInfo);
