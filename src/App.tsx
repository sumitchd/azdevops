import React, { useState } from "react";
import { IUser } from "./models/core-services.model";
import { AppContext } from "./services/app-context";
import { AzureDevopsService } from "./services/azure-devops.service";
import {
  IItem,
  ITreeView,
  IWorkItemIds,
  IWorkItemsWithRelations,
} from "./models/app.model";

function App() {
  const { authClient, httpClient } = React.useContext(AppContext);
  const azDevopsService = new AzureDevopsService(httpClient);
  const [user, setUser] = useState<IUser | null>(null);
  const [reloadData, setReloadData] = useState(true);
  const [treeData, setTreeData] = useState(Array<ITreeView>());
  const [currentEditItem, setCurrentEditItem] = useState({} as IItem);
  const orgName = "sumitsharma95";
  const projectName = "connected-cars";
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
          const response: IWorkItemsWithRelations = await azDevopsService.GetWorkItemIDsAsync(
            orgName,
            projectName
          );
          const commaSeperatedIds = response.workItemRelations
            .map((x) => x.target.id)
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
        }
      }
    })();
  }, [user, reloadData]);

  const onEditClick = (id: number, currentTitle: string) => {
    setCurrentEditItem({ id, title: currentTitle });
    const inputbox = document.getElementById("editTextbox") as HTMLInputElement;
    if (inputbox) {
      inputbox.value = currentTitle;
      inputbox?.focus();
    }
  };

  const printWITree = (data: ITreeView[]) => {
    return data.map((item, index) => {
      return (
        <ul>
          <li>
            <span>
              {"ID: " + item.id + " Title: " + item.title + " "}
              <a
                href="#"
                id={item.id.toString()}
                onClick={(e) => {
                  onEditClick(+e.currentTarget.id, item.title);
                }}
              >
                Edit
              </a>
            </span>
          </li>
          {item.children?.length ? printWITree(item.children) : null}
        </ul>
      );
    });
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
      }
    }
  };
  return (
    <div>
      <p>Hello {user?.name}</p>
      {printWITree(treeData)}
      <div>
        <span>
          <input type="text" id="editTextbox"></input>
          <br />
          <button onClick={onUpdateClick}>Update</button>
        </span>
      </div>
    </div>
  );
}

export default App;
