import React, { useState } from "react";
import { IUser } from "./models/core-services.model";
import { AppContext } from "./services/app-context";
import "./App.css";
import { AzureDevopsService } from "./services/azure-devops.service";
import {
  IItem,
  ITreeView,
  IWorkItemIds,
  IWorkItemsWithRelations,
} from "./models/app.model";
import { appConstants, uiMessages } from "./constants/ui.constants";

function App() {
  const { authClient, httpClient } = React.useContext(AppContext);
  const azDevopsService = new AzureDevopsService(httpClient);
  const [user, setUser] = React.useState<IUser | null>(null);
  const [reloadData, setReloadData] = React.useState(true);
  const [treeData, setTreeData] = React.useState(Array<ITreeView>());
  const [currentEditItem, setCurrentEditItem] = useState({} as IItem);
  const [pageError, setPageError] = useState("");
  const orgName = appConstants.orgName;
  const projectName = appConstants.projectName;
  React.useEffect(() => {
    (async () => {
      if (!user) {
        try {
          const user = await authClient.getUser();
          user ? setUser(user) : authClient.login().catch();
        } catch {
          authClient.login();
        }
      } else {
        if (reloadData) {
          try {
            const response: IWorkItemsWithRelations = await azDevopsService.GetWorkItemIDsAsync(
              orgName,
              projectName
            );
            const commaSeperatedIds = response.workItemRelations
              .map((x) => x.target?.id)
              .join();

            const itemDetailResponse: IWorkItemIds = await azDevopsService.GetWorkItemDetailsByIdAsync(
              orgName,
              projectName,
              commaSeperatedIds
            );
            const treeData = azDevopsService.createHierarchy(
              response.workItemRelations,
              itemDetailResponse.value
            );
            setTreeData(treeData);
            setReloadData(false);
          } catch {
            setPageError(uiMessages.pageError);
          }
        }
      }
    })();
  }, [user, reloadData]);

  const onEditClick = (id: number, currentTitle: string) => {
    setCurrentEditItem({ id, title: currentTitle });
    setTimeout(() => {
      const inputbox = document.getElementById(
        "editTextbox"
      ) as HTMLInputElement;
      if (inputbox) {
        inputbox.value = currentTitle;
        inputbox?.focus();
      }
    }, 0);
  };

  const onUpdateClick = async () => {
    const inputEle = document.getElementById("editTextbox") as HTMLInputElement;
    if (inputEle?.value) {
      const body = [
        {
          op: "replace",
          path: "/fields/System.Title",
          value: inputEle.value,
        },
      ];
      const response = await azDevopsService.UpdateWorkItemFieldAsync(
        orgName,
        projectName,
        body,
        currentEditItem.id
      );
      if (response) {
        setCurrentEditItem({} as IItem);
        inputEle.value = "";
        setReloadData(true);
        alert(uiMessages.updateSuccess);
      }
    }
  };

  const printWITree = (data: ITreeView[]) => {
    return data.map((item) => {
      return (
        <ul key={`ul_${item.id}`}>
          <li key={`li_${item.id}`}>
            <span>
              {`${uiMessages.id}: ${item.id} ${uiMessages.title}: ${item.title} `}
              <a
                href="#"
                className="App-link"
                data-testid={"edit" + item.id}
                id={item.id.toString()}
                onClick={(e) => {
                  onEditClick(+e.currentTarget.id, item.title);
                }}
              >
                {uiMessages.edit}
              </a>
            </span>
          </li>
          {item.children?.length ? printWITree(item.children) : null}
        </ul>
      );
    });
  };

  return (
    <div className="pl-5 App-header">
      <p>
        {`${uiMessages.hello}, ${user?.name}`}!
        <a
          href="#"
          className="pl-5 App-link"
          onClick={async () => {
            await authClient.logOut();
          }}
        >
          {uiMessages.logout}
        </a>
      </p>
      {pageError ? pageError : printWITree(treeData)}
      <div>
        {currentEditItem.id ? (
          <span>
            <input
              type="text"
              id="editTextbox"
              placeholder={uiMessages.editItemText}
              className="input"
              data-testid="editTextbox"
            ></input>
            <br />
            <button
              className="btn"
              data-testid="btnUpdate"
              onClick={onUpdateClick}
            >
              {uiMessages.update}
            </button>
          </span>
        ) : null}
      </div>
    </div>
  );
}

export default App;
