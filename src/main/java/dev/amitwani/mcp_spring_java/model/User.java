package dev.amitwani.mcp_spring_java.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.Map;


public class User {
  private String userName;
  private LocalDate dob;
  private LocalDate joinedDate;
  private String position;


  public User(String userName, LocalDate dob, LocalDate joinedDate, String position)
  {
    this.dob=dob;
    this.userName=userName;
    this.joinedDate=joinedDate;
    this.position=position;
  }

  public String getUserName() {
    return userName;
  }

  public void setUserName(String userName) {
    this.userName = userName;
  }

  public LocalDate getDob() {
    return dob;
  }

  public void setDob(LocalDate dob) {
    this.dob = dob;
  }

  public LocalDate getJoinedDate() {
    return joinedDate;
  }

  public void setJoinedDate(LocalDate joinedDate) {
    this.joinedDate = joinedDate;
  }

  public String getPosition() {
    return position;
  }

  public void setPosition(String position) {
    this.position = position;
  }
}