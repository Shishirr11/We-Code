import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Avatar, Tooltip } from "@mui/material";
import randomColor from "randomcolor";

const PropleList = () => {
  const avatarColors = [
    "#8bc2e8",
    "#ffafca",
    "#89c7f4",
    "#f97772",
    "#f2bf6d",
    "#8d79e0",
    "#f7bfa8",
    "#c9bafc",
    "#a085e5",
    "#a6a1ed",
  ];

  const getColor = (username) => {
    if (!username) return avatarColors[0];
    return avatarColors[username.length % 10];
  };
  const dispatch = useDispatch();
  const people = useSelector((state) => state.chatRoom.people);

  return (
    <div className="people-list flex ml-2 gap-2">
      {people.map((person, ind) => (
        <div className="person-avatar" key={`person-${ind}`}>
          <Tooltip title={person.username} arrow placement="bottom">
            <Avatar
              sx={{
                width: 35,
                height: 35,
                paddingBottom: 0,
                marginBottom: 0,
                backgroundColor: getColor(person.username),
                // backgroundColor:
                //   avatarColors[
                //     person.username ? person.username.length % 10 : 0
                //   ],
              }}
            >
              {person?.username.length > 0 ? person?.username[0] : "U"}
            </Avatar>
          </Tooltip>
        </div>
      ))}
    </div>
  );
};

export default PropleList;
