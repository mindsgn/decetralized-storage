pragma solidity ^0.5.0;

contract DStorage {
  // Name;
  string public name = "decentralized File Storage";
  // Number of files
  // Mapping fileId=>Struct 

  uint public fileCount = 0;

  mapping ( uint=> File) public files;

  // Struct
  struct File {
    uint fileId;
    string fileHash;
    uint fileSize;
    string fileName;
    string fileType;
    string fileDescription;
    uint uploadTime;
    address payable uploader;
  }

  // Event
  event FileUploaded(
    uint fileId,
    string fileHash,
    uint fileSize,
    string fileName,
    string fileType,
    string fileDescription,
    uint uploadTime,
    address payable uploader
  );

  constructor() public {
  }

  function uploadFile(string memory _fileHash, uint _fileSize, string memory _fileType, string memory _fileName, string memory _fileDescription) public {  
    require(bytes(_fileHash).length > 0);
    require(bytes(_fileType).length > 0);
    require(bytes(_fileDescription).length > 0);
    require(bytes(_fileName).length > 0);
    require(msg.sender!=address(0));
    require(_fileSize>0);

    fileCount += 1;
    files[fileCount] = File(fileCount, _fileHash, _fileSize, _fileName, _fileType, _fileDescription, now, msg.sender);

    emit FileUploaded(fileCount, _fileHash, _fileSize, _fileName, _fileType, _fileDescription, now, msg.sender);
  }
}