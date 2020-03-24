import React from "react";
import { Menu, Dropdown, Button, Icon, Tooltip, Table } from "antd";
import PropTypes from "prop-types";
import * as Strings from "@common/constants/strings";
import { formatDate, dateSorter, formatMoney } from "@common/utils/helpers";
import NullScreen from "@/components/common/NullScreen";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import * as Permission from "@/constants/permissions";
import CustomPropTypes from "@/customPropTypes";
import { EDIT, CARAT } from "@/constants/assets";
import CoreTable from "@/components/common/CoreTable";

/**
 * @class  MineBondTable - displays a table of permits with their related bonds
 */

const propTypes = {
  permits: PropTypes.arrayOf(CustomPropTypes.permit).isRequired,
  // eslint-disable-next-line react/no-unused-prop-types
  bondStatusOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
  // eslint-disable-next-line react/no-unused-prop-types
  bondTypeOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
  bonds: PropTypes.arrayOf(CustomPropTypes.bond).isRequired,
  isLoaded: PropTypes.bool.isRequired,
  expandedRowKeys: PropTypes.arrayOf(PropTypes.string).isRequired,
  // eslint-disable-next-line react/no-unused-prop-types
  openEditBondModal: PropTypes.func.isRequired,
  // eslint-disable-next-line react/no-unused-prop-types
  openViewBondModal: PropTypes.func.isRequired,
  // eslint-disable-next-line react/no-unused-prop-types
  openAddBondModal: PropTypes.func.isRequired,
  // eslint-disable-next-line react/no-unused-prop-types
  releaseOrConfiscateBond: PropTypes.func.isRequired,
  // eslint-disable-next-line react/no-unused-prop-types
  onExpand: PropTypes.func.isRequired,
};

export const MineBondTable = (props) => {
  const columns = [
    {
      title: "Permit No.",
      dataIndex: "permit_no",
      key: "permit_no",
      render: (text) => <div title="Permit No.">{text}</div>,
    },
    {
      title: "Amount Assessed",
      dataIndex: "security_total",
      key: "security_total",
      render: (text, record) => (
        <div title="Security Total">
          {formatMoney(record.permit_amendments[0].security_total) || Strings.EMPTY_FIELD}
        </div>
      ),
    },
    {
      title: "Amount Held",
      dataIndex: "amount_held",
      key: "amount_held",
      render: (text) => <div title="Total Bonds">{text || Strings.EMPTY_FIELD}</div>,
    },
    {
      title: "Total Bonds",
      dataIndex: "total_bonds",
      key: "total_bonds",
      render: (text) => <div title="Total Bonds">{text || Strings.EMPTY_FIELD}</div>,
    },
    {
      title: "Amount Confiscated",
      dataIndex: "amount_confiscated",
      key: "amount_confiscated",
      render: (text) => (
        <div title="Amount Confiscated">{formatMoney(text) || Strings.EMPTY_FIELD}</div>
      ),
    },
    {
      title: "",
      dataIndex: "addEditButton",
      key: "addEditButton",
      align: "right",
      render: (text, record) => {
        return (
          <AuthorizationWrapper permission={Permission.EDIT_SECURITIES}>
            <Button
              type="secondary"
              className="permit-table-button"
              onClick={(event) => props.openAddBondModal(event, record.permit_guid)}
            >
              <div className="padding-small">
                <img className="padding-small--right icon-svg-filter" src={EDIT} alt="Add/Edit" />
                Add Bond
              </div>
            </Button>
          </AuthorizationWrapper>
        );
      },
    },
  ];

  const bondColumns = [
    {
      title: "Bond No.",
      dataIndex: "bond_id",
      key: "bond_id",
      sorter: (a, b) => (a.bond_id > b.bond_id ? -1 : 1),
      render: (text) => <div title="Bond No.">{text}</div>,
    },
    {
      title: "Issue Date",
      dataIndex: "issue_date",
      key: "issue_date",
      sorter: dateSorter("due_date"),
      render: (text) => <div title="Issue Date">{formatDate(text) || Strings.EMPTY_FIELD}</div>,
    },
    {
      title: "Payer",
      dataIndex: "payer_party_guid",
      key: "payer_party_guid",
      render: (text, record) => <div title="Payer">{record.payer.name || Strings.EMPTY_FIELD}</div>,
    },
    {
      title: "Institution",
      dataIndex: "institution_name",
      key: "institution_name",
      render: (text) => <div title="Institution">{text || Strings.EMPTY_FIELD}</div>,
    },
    {
      title: "Type",
      dataIndex: "bond_type_code",
      key: "bond_type_code",
      sorter: (a, b) => (a.bond_type_code > b.bond_type_code ? -1 : 1),
      render: (text) => (
        <div title="Type">{props.bondTypeOptionsHash[text] || Strings.EMPTY_FIELD}</div>
      ),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (text) => <div title="Amount">{formatMoney(text) || Strings.EMPTY_FIELD}</div>,
    },
    {
      title: "Status",
      dataIndex: "bond_status_code",
      key: "bond_status_code",
      sorter: (a, b) => (a.bond_status_code > b.bond_status_code ? -1 : 1),
      render: (text) => (
        <div title="Status">{props.bondStatusOptionsHash[text] || Strings.EMPTY_FIELD}</div>
      ),
      defaultSortOrder: "descend",
    },
    {
      title: "",
      dataIndex: "addEditButton",
      key: "addEditButton",
      align: "right",
      render: (text, record) => {
        const menu = (
          <Menu>
            {record.bond_status_code === "ACT" && (
              <span>
                <div className="custom-menu-item">
                  <button
                    type="button"
                    className="full"
                    onClick={() => props.releaseOrConfiscateBond("REL", record.bond_guid, record)}
                  >
                    Release Bond
                  </button>
                </div>
                <div className="custom-menu-item">
                  <button
                    type="button"
                    className="full"
                    onClick={() => props.releaseOrConfiscateBond("CON", record.bond_guid, record)}
                  >
                    Confiscate Bond
                  </button>
                </div>
              </span>
            )}
            <Menu.Item key="2">
              <button
                type="button"
                className="full"
                onClick={(event) => props.openEditBondModal(event, record)}
              >
                Edit Bond
              </button>
            </Menu.Item>
          </Menu>
        );
        return (
          <div>
            <Button
              type="secondary"
              className="permit-table-button"
              onClick={(event) => props.openViewBondModal(event, record)}
            >
              <div className="padding-small">
                <Icon type="eye" alt="View" className="icon-lg icon-svg-filter" />
              </div>
            </Button>
            <AuthorizationWrapper permission={Permission.EDIT_SECURITIES}>
              <Dropdown className="full-height full-mobile" overlay={menu} placement="bottomLeft">
                <Button type="secondary" className="permit-table-button">
                  <div className="padding-small">
                    <img
                      className="padding-small--right icon-svg-filter"
                      src={CARAT}
                      alt="Menu"
                      style={{ paddingLeft: "5px" }}
                    />
                  </div>
                </Button>
              </Dropdown>
            </AuthorizationWrapper>
          </div>
        );
      },
    },
  ];

  const bondsByPermit = (permit) =>
    props.bonds.filter(({ permit_guid }) => permit_guid === permit.permit_guid);

  const getSum = (status, permit) =>
    props.bonds
      .filter(
        ({ bond_status_code, permit_guid }) =>
          bond_status_code === status && permit_guid === permit.permit_guid
      )
      .reduce((a, b) => +a + +b.amount, 0);

  const bonds = (record) => {
    return (
      <Table
        align="left"
        pagination={false}
        columns={bondColumns}
        dataSource={bondsByPermit(record)}
      />
    );
  };

  const RenderTableExpandIcon = (rowProps) => (
    <a
      role="link"
      className="expand-row-icon"
      onClick={(e) => rowProps.onExpand(rowProps.record, e)}
      onKeyPress={(e) => rowProps.onExpand(rowProps.record, e)}
      style={{ cursor: "pointer" }}
      tabIndex="0"
    >
      {rowProps.expanded ? (
        <Tooltip title="Click to hide associated bonds." placement="right" mouseEnterDelay={1}>
          <Icon type="minus-square" theme="filled" className="icon-lg--grey" />
        </Tooltip>
      ) : (
        <Tooltip title="Click to view associated bonds." placement="right" mouseEnterDelay={1}>
          <Icon type="plus-square" theme="filled" className="icon-lg--grey" />
        </Tooltip>
      )}
    </a>
  );

  const transformRowData = (permits) =>
    permits.map((permit) => {
      return {
        key: permit.permit_guid,
        total_bonds: bondsByPermit(permit).length,
        amount_confiscated: getSum("CON", permit),
        amount_held: getSum("ACT", permit),
        ...permit,
      };
    });

  return (
    <CoreTable
      condition={props.isLoaded}
      dataSource={transformRowData(props.permits)}
      columns={columns}
      tableProps={{
        className: "nested-table",
        rowClassName: "table-row-align-middle pointer fade-in",
        align: "left",
        pagination: false,
        locale: { emptyText: <NullScreen type="securities" /> },
        expandIcon: RenderTableExpandIcon,
        expandRowByClick: true,
        expandedRowRender: bonds,
        expandedRowKeys: props.expandedRowKeys,
        onExpand: props.onExpand,
      }}
    />
  );
};

MineBondTable.propTypes = propTypes;

export default MineBondTable;
