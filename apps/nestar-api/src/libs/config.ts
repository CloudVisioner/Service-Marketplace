import { ObjectId } from 'bson';

export const availableUserSorts = ['createdAt', 'updatedAt'];

// IMAGE CONFIGURATION (config.js)
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import { T } from './types/common';

export const validMimeTypes = ['image/png', 'image/jpg', 'image/jpeg'];
export const getSerialForImage = (filename: string) => {
	const ext = path.parse(filename).ext;
	return uuidv4() + ext;
};

export const shapeIntoMongoObjectId = (target: any) => {
	return typeof target === 'string' ? new ObjectId(target) : target;
};

export const lookupAuthUserLiked = (userId: T, targetRefId: string = '$_id') => {
	return {
		$lookup: {
			from: 'likes',
			let: {
				localLikeRefId: targetRefId,
				localUserId: userId,
				localMyFavorite: true,
			},
			pipeline: [
				{
					$match: {
						$expr: {
							$and: [{ $eq: ['$likeRefId', '$$localLikeRefId'] }, { $eq: ['$userId', '$$localUserId'] }],
						},
					},
				},
				{
					$project: {
						_id: 0,
						userId: 1,
						likeRefId: 1,
						myFavorite: '$$localMyFavorite',
					},
				},
			],
			as: 'meLiked',
		},
	};
};

interface LookupAuthUserFollowed {
	followerUserId: T;
	followedOrgId: string;
}
export const lookupAuthUserFollowed = (input: LookupAuthUserFollowed) => {
	const {followerUserId, followedOrgId} = input;
	return {
		$lookup: {
			from: 'follows',
			let: {
				localFollowerUserId: followerUserId,
				localFollowedOrgId: followedOrgId,
				localMyFavorite: true,
			},
			pipeline: [
				{
					$match: {
						$expr: {
							$and: [{ $eq: ['$followerUserId', '$$localFollowerUserId'] }, { $eq: ['$followedOrgId', '$$localFollowedOrgId'] }],
						},
					},
				},
				{
					$project: {
						_id: 0,
						followerUserId: 1,
						followedOrgId: 1,
						myFollowing: '$$localMyFavorite',
					},
				},
			],
			as: 'meFollowed',
		},
	};
};

export const lookupUser = {
	$lookup: {
		from: 'users',
		localField: 'userId',
		foreignField: '_id',
		as: 'userData',
	},
};


