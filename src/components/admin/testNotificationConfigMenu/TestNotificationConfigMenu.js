import React, { useContext, useState, useEffect, useRef } from "react";
import {
  Heading,
  Button,
  Loading,
  Grid,
  Column,
  Section,
  DataTable,
  Table,
  TableHead,
  TableRow,
  TableBody,
  TableHeader,
  TableCell,
  TableContainer,
  Pagination,
} from "@carbon/react";
import {
  getFromOpenElisServer,
  postToOpenElisServerJsonResponse,
} from "../../utils/Utils.js";
import {
  AlertDialog,
  NotificationKinds,
} from "../../common/CustomNotification.js";
import { FormattedMessage, injectIntl, useIntl } from "react-intl";
import PageBreadCrumb from "../../common/PageBreadCrumb.js";
import { Settings } from "@carbon/icons-react";

const styles = {
  buttonContainer: {
    display: "flex",
    justifyContent: "center",
    marginTop: "1rem",
    flexWrap: "wrap", // Allows buttons to wrap
    gap: "1rem",
  },
  buttonColumn: {
    display: "flex",
    justifyContent: "space-between",
    gap: "1rem",
    flexWrap: "wrap",
  },
  responsiveButton: {
    flex: 1,
    minWidth: "120px",
    maxWidth: "250px",
    padding: "0.5rem 1rem",
  },
  responsiveIconButton: {
    width: "40px",
    height: "40px",
    padding: "5px",
  },
  smallScreen: {
    maxWidth: "100%",
    flexDirection: "column",
    alignItems: "center",
  },
};

function TestNotificationConfigMenu() {
  const { notificationVisible, setNotificationVisible, addNotification } =
    useContext(NotificationContext);

  const intl = useIntl();

  const componentMounted = useRef(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [loading, setLoading] = useState(true);
  const [saveButton, setSaveButton] = useState(true);
  const [testNamesList, setTestNamesList] = useState([]);
  const [testNotificationConfigMenuData, setTestNotificationConfigMenuData] =
    useState({});
  const [
    testNotificationConfigMenuDataPost,
    setTestNotificationConfigMenuDataPost,
  ] = useState({ menuList: [] });
  const [testNamesMap, setTestNamesMap] = useState({});

  useEffect(() => {
    componentMounted.current = true;
    getFromOpenElisServer(`/rest/TestNotificationConfigMenu`, handleMenuItems);
    getFromOpenElisServer(`/rest/test-list`, handleTestNamesList);
    return () => {
      componentMounted.current = false;
    };
  }, []);

  const handleMenuItems = (res) => {
    if (res) {
      setTestNotificationConfigMenuData(res);
    }
    setLoading(false);
  };

  const handleTestNamesList = (res) => {
    if (res) {
      setTestNamesList(res);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (
      testNotificationConfigMenuData &&
      testNotificationConfigMenuData.menuList
    ) {
      setTestNotificationConfigMenuDataPost((prevData) => ({
        ...prevData,
        menuList: testNotificationConfigMenuData.menuList,
      }));
    }
  }, [testNotificationConfigMenuData]);

  useEffect(() => {
    const map = testNamesList.reduce((acc, item) => {
      acc[item.id] = item.value;
      return acc;
    }, {});
    setTestNamesMap(map);
  }, [testNamesList]);

  const handleEditButtonClick = (id) => {
    window.location.assign(`/MasterListsPage#testNotificationConfig?testId=${id}`);
  };

  const testNotificationConfigMenuSavePostCall = () => {
    setLoading(true);
    postToOpenElisServerJsonResponse(
      `/rest/TestNotificationConfigMenu`,
      JSON.stringify(testNotificationConfigMenuDataPost),
      (res) => {
        if (res) {
          addNotification({
            title: intl.formatMessage({ id: "notification.title" }),
            message: intl.formatMessage({ id: "notification.user.post.save.success" }),
            kind: NotificationKinds.success,
          });
        } else {
          addNotification({
            kind: NotificationKinds.error,
            title: intl.formatMessage({ id: "notification.title" }),
            message: intl.formatMessage({ id: "server.error.msg" }),
          });
        }
        setNotificationVisible(true);
        setLoading(false);
      }
    );
  };

  return (
    <>
      {notificationVisible && <AlertDialog />}
      {loading && <Loading />}
      <div className="adminPageContent">
        <PageBreadCrumb breadcrumbs={breadcrumbs} />
        <Grid fullWidth>
          <Column lg={16} md={8} sm={4}>
            <div style={styles.buttonContainer}>
              <Button
                style={styles.responsiveButton}
                disabled={saveButton}
                onClick={testNotificationConfigMenuSavePostCall}
                type="button"
              >
                <FormattedMessage id="label.button.save" />
              </Button>
              <Button
                style={styles.responsiveButton}
                onClick={() => window.location.assign("/MasterListsPage#testNotificationConfigMenu")}
                kind="tertiary"
                type="button"
              >
                <FormattedMessage id="label.button.exit" />
              </Button>
            </div>
          </Column>
        </Grid>
        <Grid fullWidth>
          <Column lg={16} md={8} sm={4}>
            <DataTable
              rows={testNotificationConfigMenuDataPost.menuList.map((item) => ({
                id: item.testId,
                testId: item.testId,
                patientEmail: item.patientEmail.active ? "true" : "false",
                patientSMS: item.patientSMS.active ? "true" : "false",
                providerEmail: item.providerEmail.active ? "true" : "false",
                providerSMS: item.providerSMS.active ? "true" : "false",
                testName: testNamesMap[item.testId] || item.testId,
              }))}
              headers={[
                { key: "testId", header: intl.formatMessage({ id: "column.name.testId" }) },
                { key: "testName", header: intl.formatMessage({ id: "label.testName" }) },
                { key: "patientEmail", header: intl.formatMessage({ id: "testnotification.patient.email" }) },
                { key: "patientSMS", header: intl.formatMessage({ id: "testnotification.patient.sms" }) },
                { key: "providerEmail", header: intl.formatMessage({ id: "testnotification.provider.email" }) },
                { key: "providerSMS", header: intl.formatMessage({ id: "testnotification.provider.sms" }) },
                { key: "edit", header: intl.formatMessage({ id: "banner.menu.patientEdit" }) },
              ]}
            >
              {({ rows, headers, getHeaderProps }) => (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        {headers.map((header) => (
                          <TableHeader key={header.key} {...getHeaderProps({ header })}>
                            {header.header}
                          </TableHeader>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rows.map((row) => (
                        <TableRow key={row.id}>
                          {row.cells.map((cell) => (
                            <TableCell key={cell.id}>
                              {cell.info.header === "edit" ? (
                                <Button
                                  hasIconOnly
                                  style={styles.responsiveIconButton}
                                  iconDescription="Edit"
                                  onClick={() => handleEditButtonClick(row.id)}
                                  renderIcon={Settings}
                                  kind="tertiary"
                                />
                              ) : (
                                cell.value
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </DataTable>
          </Column>
        </Grid>
      </div>
    </>
  );
}

export default injectIntl(TestNotificationConfigMenu);
