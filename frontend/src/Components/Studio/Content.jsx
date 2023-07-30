import LeftPanel2 from "../LeftPanel2";
import Navbar2 from "../Navbar2";
import "../../Css/Studio/content.css";
import SouthIcon from "@mui/icons-material/South";
import { useEffect, useState } from "react";
import jwtDecode from "jwt-decode";
import RemoveRedEyeOutlinedIcon from "@mui/icons-material/RemoveRedEyeOutlined";
import ModeEditOutlineOutlinedIcon from "@mui/icons-material/ModeEditOutlineOutlined";
import ChatOutlinedIcon from "@mui/icons-material/ChatOutlined";
import YouTubeIcon from "@mui/icons-material/YouTube";
import MoreVertOutlinedIcon from "@mui/icons-material/MoreVertOutlined";
import NorthOutlinedIcon from "@mui/icons-material/NorthOutlined";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import KeyboardTabOutlinedIcon from "@mui/icons-material/KeyboardTabOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import Tooltip from "@mui/material/Tooltip";
import Zoom from "@mui/material/Zoom";

function Content() {
  const [userVideos, setUserVideos] = useState([]);
  const [sortByDateAsc, setSortByDateAsc] = useState(true);
  const [Email, setEmail] = useState();
  const [changeSort, setChangeSort] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const videoUrl = "http://localhost:5173/video";

  useEffect(() => {
    const token = localStorage.getItem("userToken");
    setEmail(jwtDecode(token).email);
  }, []);

  useEffect(() => {
    const GetUserVideos = async () => {
      try {
        if (Email !== undefined) {
          const response = await fetch(
            `http://localhost:3000/getuservideos/${Email}`
          );

          const data = await response.json();
          setUserVideos(data);
        }
      } catch (error) {
        // console.log(error.message);
      }
    };

    const interval = setInterval(GetUserVideos, 100);

    return () => clearInterval(interval);
  }, [Email]);

  const handleSortByDate = () => {
    setSortByDateAsc((prevState) => !prevState);
    setChangeSort(!changeSort);
  };

  const sortedUserVideos = userVideos.sort((a, b) => {
    if (sortByDateAsc) {
      return new Date(a.uploaded_date) - new Date(b.uploaded_date);
    } else {
      return new Date(b.uploaded_date) - new Date(a.uploaded_date);
    }
  });

  //POST REQUESTS

  const DeleteVideo = async (id) => {
    try {
      if (id !== undefined) {
        const response = await fetch(
          `http://localhost:3000//deletevideo/${id}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        await response.json();
      }
    } catch (error) {
      // console.log(error.message);
    }
  };

  const handleCopyLink = (id) => {
    navigator.clipboard
      .writeText(`${videoUrl}/${id}`)
      .then(() => {
        alert("Link Copied!");
      })
      .catch((error) => {
        console.log("Error copying link to clipboard:", error);
      });
  };

  const downloadVideo = (url) => {
    const link = document.createElement("a");
    link.href = url;
    link.target = "_blank";
    link.download = "video.mp4";
    link.click();
  };

  return (
    <>
      <Navbar2 />
      <LeftPanel2 />
      <div className="channel-content-section">
        <div className="channel-content-top">
          <p>Channel content</p>
          <p className="channel-videosss">Videos</p>
        </div>
        <hr className="breakk2 breakkk" />
        <div className="channels-uploaded-videos-section">
          {sortedUserVideos && sortedUserVideos.length > 0 && (
            <table className="videos-table">
              <thead>
                <tr style={{ color: "#aaa", fontSize: "14px" }}>
                  <th
                    style={{
                      textAlign: "left",
                      paddingLeft: "40px",
                      width: "45%",
                    }}
                  >
                    Video
                  </th>
                  <th>Visibility</th>
                  <th onClick={handleSortByDate} className="date-table-head">
                    <div className="table-row">
                      <p>Date</p>
                      {changeSort === false ? (
                        <SouthIcon
                          fontSize="200px"
                          style={{ color: "white", marginLeft: "5px" }}
                        />
                      ) : (
                        <NorthOutlinedIcon
                          fontSize="200px"
                          style={{ color: "white", marginLeft: "5px" }}
                        />
                      )}
                    </div>
                  </th>
                  <th>Views</th>
                  <th>Comments</th>
                  <th>Likes</th>
                </tr>
              </thead>
              <tbody>
                {sortedUserVideos.map((element, index) => {
                  const uploaded = new Date(element.uploaded_date);
                  return (
                    <tr key={index} className="table-roww">
                      <td className="video-cell">
                        <img
                          src={element.thumbnailURL}
                          alt="thumbnail"
                          className="studio-video-thumbnail"
                        />
                        <p className="video-left-duration">
                          {Math.floor(element.videoLength / 60) +
                            ":" +
                            (Math.round(element.videoLength % 60) < 10
                              ? "0" + Math.round(element.videoLength % 60)
                              : Math.round(element.videoLength % 60))}
                        </p>
                        <div className="studio-video-details">
                          <p className="studio-video-title">
                            {element.Title.length <= 40
                              ? element.Title
                              : `${element.Title.slice(0, 40)}...`}
                          </p>
                          {element.Description ? (
                            <p className="studio-video-desc">
                              {element.Description.length <= 85
                                ? element.Description
                                : `${element.Description.slice(0, 85)}...`}
                            </p>
                          ) : (
                            <p>Add description</p>
                          )}
                          <div className="video-editable-section">
                            <Tooltip
                              TransitionComponent={Zoom}
                              title="Details"
                              placement="bottom"
                            >
                              <ModeEditOutlineOutlinedIcon
                                className="video-edit-icons"
                                fontSize="medium"
                                style={{ color: "#aaa" }}
                              />
                            </Tooltip>
                            <Tooltip
                              TransitionComponent={Zoom}
                              title="Comments"
                              placement="bottom"
                            >
                              <ChatOutlinedIcon
                                className="video-edit-icons"
                                fontSize="medium"
                                style={{ color: "#aaa" }}
                              />
                            </Tooltip>
                            <Tooltip
                              TransitionComponent={Zoom}
                              title="View on YouTube"
                              placement="bottom"
                            >
                              <YouTubeIcon
                                className="video-edit-icons"
                                fontSize="medium"
                                style={{ color: "#aaa" }}
                                onClick={() => {
                                  window.location.href = `/video/${element._id}`;
                                }}
                              />
                            </Tooltip>
                            <Tooltip
                              TransitionComponent={Zoom}
                              title="Options"
                              placement="bottom"
                            >
                              <MoreVertOutlinedIcon
                                className="video-edit-icons"
                                fontSize="medium"
                                style={{ color: "#aaa" }}
                                onClick={() => setShowOptions(!showOptions)}
                              />
                            </Tooltip>
                            <div
                              className="extra-options-menu"
                              style={
                                showOptions === true
                                  ? { display: "flex" }
                                  : { display: "none" }
                              }
                            >
                              <div className="edit-video-data-row option-row">
                                <ModeEditOutlineOutlinedIcon
                                  className="video-edit-icons"
                                  fontSize="medium"
                                  style={{ color: "#aaa" }}
                                />
                                <p>Edit title and description</p>
                              </div>
                              <div
                                className="share-video-data-row option-row"
                                onClick={() => handleCopyLink(element._id)}
                              >
                                <ShareOutlinedIcon
                                  className="video-edit-icons"
                                  fontSize="medium"
                                  style={{ color: "#aaa" }}
                                />
                                <p>Get shareable link</p>
                              </div>
                              <div
                                className="download-video-data-row option-row"
                                onClick={() => downloadVideo(element.videoURL)}
                              >
                                <KeyboardTabOutlinedIcon
                                  className="video-edit-icons"
                                  fontSize="medium"
                                  style={{
                                    color: "#aaa",
                                    transform: "rotate(90deg)",
                                  }}
                                />
                                <p>Download</p>
                              </div>
                              <div className="delete-video-data-row option-row">
                                <DeleteOutlineOutlinedIcon
                                  className="video-edit-icons"
                                  fontSize="medium"
                                  style={{ color: "#aaa" }}
                                />
                                <p>Delete forever</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="privacy-table">
                          <RemoveRedEyeOutlinedIcon
                            fontSize="small"
                            style={{ color: "#2ba640" }}
                          />
                          <p style={{ marginLeft: "8px" }}>
                            {element.visibility}
                          </p>
                        </div>
                      </td>
                      <td>
                        <p>
                          {uploaded.toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </td>
                      <td>
                        <p>{element.views && element.views.toLocaleString()}</p>
                      </td>
                      <td>
                        <p>{element.comments && element.comments.length}</p>
                      </td>
                      <td>
                        <p>{element.likes}</p>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
      <div className="last-delete-warning">
        
      </div>
    </>
  );
}

export default Content;