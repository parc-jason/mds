import { notification } from "antd";
import { showLoading, hideLoading } from "react-redux-loading-bar";
import { error, request, success } from "@common/actions/genericActions";
import { ENVIRONMENT } from "@common/constants/environment";
import { createRequestHeader } from "@common/utils/RequestHeaders";
import CustomAxios from "@common/customAxios";
import * as COMMON_API from "@common/constants/API";
import * as API from "@/constants/API";
import * as reducerTypes from "@/constants/reducerTypes";

export const generateNoticeOfWorkApplicationDocument = (documentTypeCode, payload) => (
  dispatch
) => {
  dispatch(request(reducerTypes.GENERATE_NOTICE_OF_WORK_APPLICATION_DOCUMENT));
  dispatch(showLoading("modal"));
  return CustomAxios()
    .post(
      `${ENVIRONMENT.apiUrl}${COMMON_API.NOW_APPLICATION_DOCUMENT_TYPE_OPTIONS}/${documentTypeCode}/generate`,
      payload,
      createRequestHeader()
    )
    .then((response) => {
      const token = { token: response.data.token };
      window.open(`${ENVIRONMENT.apiUrl + API.RETRIEVE_CORE_DOCUMENT(token)}`, "_blank");
      notification.success({
        message: "Successfully generated Notice of Work document",
        duration: 10,
      });
      dispatch(success(reducerTypes.GENERATE_NOTICE_OF_WORK_APPLICATION_DOCUMENT));
      return response;
    })
    .catch(() => dispatch(error(reducerTypes.GENERATE_NOTICE_OF_WORK_APPLICATION_DOCUMENT)))
    .finally(() => dispatch(hideLoading("modal")));
};

export default generateNoticeOfWorkApplicationDocument;
