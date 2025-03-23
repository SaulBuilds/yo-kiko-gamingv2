// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract GameBets is ReentrancyGuard, Ownable {
    struct Bet {
        uint256 matchId;
        address player1;
        address player2;
        address tokenAddress; // address(0) for ETH
        uint256 amount;
        uint256 timestamp;
        bool isActive;
        bool isPaid;
    }

    mapping(uint256 => Bet) public bets;
    uint256 public betTimeoutPeriod = 1 hours;
    
    event BetCreated(uint256 indexed matchId, address indexed player1, address tokenAddress, uint256 amount);
    event BetAccepted(uint256 indexed matchId, address indexed player2);
    event BetPaid(uint256 indexed matchId, address indexed winner, uint256 amount);
    event BetRefunded(uint256 indexed matchId, address indexed player, uint256 amount);

    constructor() Ownable(msg.sender) {}

    function createBet(uint256 matchId, address tokenAddress) external payable {
        require(bets[matchId].player1 == address(0), "Bet already exists");
        
        uint256 betAmount;
        if (tokenAddress == address(0)) {
            // ETH bet
            betAmount = msg.value;
            require(betAmount > 0, "Must send ETH for bet");
        } else {
            // ERC20 bet
            IERC20 token = IERC20(tokenAddress);
            betAmount = token.allowance(msg.sender, address(this));
            require(betAmount > 0, "Must approve tokens for bet");
            require(token.transferFrom(msg.sender, address(this), betAmount), "Token transfer failed");
        }

        bets[matchId] = Bet({
            matchId: matchId,
            player1: msg.sender,
            player2: address(0),
            tokenAddress: tokenAddress,
            amount: betAmount,
            timestamp: block.timestamp,
            isActive: true,
            isPaid: false
        });

        emit BetCreated(matchId, msg.sender, tokenAddress, betAmount);
    }

    function acceptBet(uint256 matchId) external payable {
        Bet storage bet = bets[matchId];
        require(bet.isActive, "Bet is not active");
        require(bet.player2 == address(0), "Bet already accepted");
        require(bet.player1 != msg.sender, "Cannot accept own bet");
        require(block.timestamp - bet.timestamp <= betTimeoutPeriod, "Bet expired");

        if (bet.tokenAddress == address(0)) {
            // ETH bet
            require(msg.value == bet.amount, "Must match bet amount");
        } else {
            // ERC20 bet
            IERC20 token = IERC20(bet.tokenAddress);
            require(token.transferFrom(msg.sender, address(this), bet.amount), "Token transfer failed");
        }

        bet.player2 = msg.sender;
        emit BetAccepted(matchId, msg.sender);
    }

    function payoutBet(uint256 matchId, address winner) external onlyOwner nonReentrant {
        Bet storage bet = bets[matchId];
        require(bet.isActive, "Bet is not active");
        require(!bet.isPaid, "Bet already paid");
        require(winner == bet.player1 || winner == bet.player2, "Invalid winner");

        uint256 payout = bet.amount * 2; // Winner gets both bets
        bet.isActive = false;
        bet.isPaid = true;

        if (bet.tokenAddress == address(0)) {
            // ETH payout
            (bool success, ) = winner.call{value: payout}("");
            require(success, "ETH transfer failed");
        } else {
            // ERC20 payout
            IERC20 token = IERC20(bet.tokenAddress);
            require(token.transfer(winner, payout), "Token transfer failed");
        }

        emit BetPaid(matchId, winner, payout);
    }

    function refundBet(uint256 matchId) external nonReentrant {
        Bet storage bet = bets[matchId];
        require(bet.isActive, "Bet not active");
        require(!bet.isPaid, "Bet already paid");
        require(block.timestamp - bet.timestamp > betTimeoutPeriod, "Bet not expired");

        if (bet.player2 == address(0)) {
            // No player2, refund player1
            bet.isActive = false;
            bet.isPaid = true;

            if (bet.tokenAddress == address(0)) {
                (bool success, ) = bet.player1.call{value: bet.amount}("");
                require(success, "ETH transfer failed");
            } else {
                IERC20 token = IERC20(bet.tokenAddress);
                require(token.transfer(bet.player1, bet.amount), "Token transfer failed");
            }

            emit BetRefunded(matchId, bet.player1, bet.amount);
        } else {
            // Both players joined, refund both
            uint256 refundAmount = bet.amount;
            bet.isActive = false;
            bet.isPaid = true;

            if (bet.tokenAddress == address(0)) {
                (bool success1, ) = bet.player1.call{value: refundAmount}("");
                require(success1, "ETH transfer to player1 failed");
                (bool success2, ) = bet.player2.call{value: refundAmount}("");
                require(success2, "ETH transfer to player2 failed");
            } else {
                IERC20 token = IERC20(bet.tokenAddress);
                require(token.transfer(bet.player1, refundAmount), "Token transfer to player1 failed");
                require(token.transfer(bet.player2, refundAmount), "Token transfer to player2 failed");
            }

            emit BetRefunded(matchId, bet.player1, refundAmount);
            emit BetRefunded(matchId, bet.player2, refundAmount);
        }
    }

    // Allow contract to receive ETH
    receive() external payable {}
}
