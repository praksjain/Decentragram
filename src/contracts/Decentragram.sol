pragma solidity ^0.5.6;

contract Decentragram {
    string public name = "Decentragram";

    // Store Images
    // uint -> similar to id
    // Image -> IPFS Hash Value
    uint256 public imageCounter = 0;
    mapping(uint256 => Image) public images;
    struct Image {
        uint256 id;
        string hash;
        string description;
        uint256 amount;
        address payable creator;
    }

    event ImageCreated(
        uint256 id,
        string hash,
        string description,
        uint256 amount,
        address payable creator
    );

    event ImageTipped(
        uint256 id,
        string hash,
        string description,
        uint256 amount,
        address payable creator
    );

    // Create Images
    function uploadImage(string memory _imgHash, string memory _description)
        public
    {
        // Check for image hash, blank description and blank sender
        require(
            bytes(_description).length > 0,
            "Unable to upload image with blank description"
        );
        require(bytes(_imgHash).length > 0, "Unable to upload blank image ");
        require(
            msg.sender != address(0),
            "Unable to upload image with blank address"
        );
        // Increment image counter by 1
        imageCounter += 1;

        // Add image to contract
        images[imageCounter] = Image(
            imageCounter,
            _imgHash,
            _description,
            0,
            msg.sender
        );

        // Trigger an event
        emit ImageCreated(imageCounter, _imgHash, _description, 0, msg.sender);
    }

    // Tip Images
    function tipImageOwner(uint256 _id) public payable {
        require(_id > 0 && _id <= imageCounter);
        // Fetch the image
        Image memory _image = images[_id];

        // Fetch the creator
        address payable _creator = _image.creator;

        // Transfer the fund to the image creator
        address(_creator).transfer(msg.value);

        // Increment the amount
        _image.amount = _image.amount + msg.value;

        // Update the image
        images[_id] = _image;

        emit ImageTipped(
            _id,
            _image.hash,
            _image.description,
            _image.amount,
            _creator
        );
    }
}
