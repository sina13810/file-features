from django.shortcuts import render, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.csrf import csrf_protect
import subprocess

from django.http import JsonResponse
import os
import ffmpeg
import json
# from rest_framework import serializers
# from rest_framework.views import APIView
# from .serializers import NodeSerializer


# def compress_video(video_full_path, output_file_name, target_size):


# Compress input.mp4 to 50MB and save as output.mp4

def compress_video(video_full_path, output_file_name, target_size):
    # Reference: https://en.wikipedia.org/wiki/Bit_rate#Encoding_bit_rate
    min_audio_bitrate = 32000
    max_audio_bitrate = 256000

    probe = ffmpeg.probe(video_full_path)
    # Video duration, in s.
    duration = float(probe['format']['duration'])
    # Audio bitrate, in bps.
    audio_bitrate = float(next(
        (s for s in probe['streams'] if s['codec_type'] == 'audio'), None)['bit_rate'])
    # Target total bitrate, in bps.
    target_total_bitrate = (target_size * 1024 * 8) / (1.073741824 * duration)

    # Target audio bitrate, in bps
    if 10 * audio_bitrate > target_total_bitrate:
        audio_bitrate = target_total_bitrate / 10
        if audio_bitrate < min_audio_bitrate < target_total_bitrate:
            audio_bitrate = min_audio_bitrate
        elif audio_bitrate > max_audio_bitrate:
            audio_bitrate = max_audio_bitrate
    # Target video bitrate, in bps.
    video_bitrate = target_total_bitrate - audio_bitrate

    i = ffmpeg.input(video_full_path)
    ffmpeg.output(i, os.devnull,
                  **{'c:v': 'libx264', 'b:v': video_bitrate, 'pass': 1, 'f': 'mp4'}).overwrite_output().run()
    ffmpeg.output(i, output_file_name,
                  **{'c:v': 'libx264', 'b:v': video_bitrate, 'pass': 2, 'c:a': 'aac', 'b:a': audio_bitrate}).overwrite_output().run()


def add_watermark_vid(input_file, output_file, watermark_file, height, width, pad):
    # FFmpeg command to add a watermark to a video
    command = f'ffmpeg -i {input_file} -i {watermark_file} -filter_complex "[1][0]scale2ref=oh*{width}:ih*{height}[logo][video];[video][logo]overlay=(main_w-overlay_w):(main_h-overlay_h)-{pad}" {output_file}'

    try:
        # Execute the FFmpeg command
        subprocess.check_output(command, shell=True)
        print("Watermark added successfully.")
    except subprocess.CalledProcessError as e:
        print(f"Error occurred: {e}")


def add_watermark_img(input_file, output_file, watermark_file, width, height, pad):
    # FFmpeg command to add a watermark to a video
    command = f'ffmpeg -i {input_file} -i {watermark_file} -filter_complex "[1:v]scale={width}:{height}[watermark];[0:v][watermark]overlay=(main_w-overlay_w):(main_h-overlay_h)-{pad}" {output_file}'

    try:
        # Execute the FFmpeg command
        subprocess.check_output(command, shell=True)
        print("Watermark added successfully.")
    except subprocess.CalledProcessError as e:
        print(f"Error occurred: {e}")

# Compress input.mp4 to 50MB and save as output.mp4

# @csrf_protect


# @csrf_exempt
# def resizing_video(request):
#     if request.method == 'POST':
#         json_object = json.loads(request.body)
#         data = json_object["data"]

#         if data == "success":

#             # print(request.method)  # POST
#             print(request.body, "\n")
#             print(json_object["suffix"])
#             vid_name = json_object["video_name"]
#             suffix = json_object["suffix"]
#             desired_size = json_object['desired_size']

#             video_full_path = f"../Videos/video.{suffix}"
#             output_file_name = f"../Videos/{vid_name}.{suffix}"
#             target_size = desired_size

#             compress_video(video_full_path, output_file_name,
#                            target_size * 1000)

#         return JsonResponse({"message": "success"})

def watermark_img(inputImg, outputImg, watermarkImage_khbrfori, width, height, padding):

    add_watermark_img(inputImg, outputImg,
                      watermarkImage_khbrfori, width, height, padding)
    # if differenceH > 190:
    #     print(1)
    #     add_watermark_img(inputImg, outputImg,
    #                       watermarkImage_khbrfori, 100, -8, 30)
    # elif differenceW > 190:
    #     print(2)
    #     add_watermark_img(inputImg, outputImg,
    #                       watermarkImage_khbrfori, 120, -6, 30)
    # elif differenceH < 190 and differenceH > 0:
    #     print(3)
    #     add_watermark_img(inputImg, outputImg,
    #                       watermarkImage_khbrfori, 230, 70, 30)

    # elif differenceW < 190 and differenceW > 0:
    #     print(4)
    #     add_watermark_img(inputImg, outputImg,
    #                       watermarkImage_khbrfori, 195, 65, 30)
    # elif differenceW == 0 and differenceH == 0:
    #     print(5)


def watermark_vid(inputVideo, outputVideo, watermarkImage_khbrfori, differenceW, differenceH, width, height):
    if differenceW > 110:
        add_watermark_vid(inputVideo, outputVideo,
                          watermarkImage_khbrfori, 0.095, 3.9, 20)
    elif differenceW > 300:
        add_watermark_vid(inputVideo, outputVideo,
                          watermarkImage_khbrfori, 0.095, 3.4, 20)
    elif height == width:
        add_watermark_vid(inputVideo, outputVideo,
                          watermarkImage_khbrfori, 0.085, 3.9, 20)
    elif differenceH >= 200:
        add_watermark_vid(inputVideo, outputVideo,
                          watermarkImage_khbrfori, 0.068, 3, 20)
    else:
        add_watermark_vid(inputVideo, outputVideo,
                          watermarkImage_khbrfori, 0.085, "mdar", 20)


def check_img_size(height, width, watermark_height, watermark_width):
    if ((height / width) >= 1.1) and ((height / width) >= 1.2):
        watermark_height /= 1.2
    elif ((height / width) >= 1.2) and ((height / width) >= 1.3):
        watermark_height /= 1.4
    elif ((height / width) >= 1.3) and ((height / width) >= 1.4):
        watermark_height /= 1.6
    elif ((height / width) >= 1.4) and ((height / width) >= 1.5):
        watermark_height /= 1.8
    elif ((height / width) >= 1.5) and ((height / width) >= 1.6):
        watermark_height /= 2
    elif ((height / width) >= 1.6) and ((height / width) >= 1.7):
        watermark_height /= 2.2
    elif ((height / width) >= 1.7) and ((height / width) >= 1.8):
        watermark_height /= 2.4
    elif ((height / width) >= 1.8) and ((height / width) >= 1.9):
        watermark_height /= 2.6
    elif ((height / width) >= 1.9) and ((height / width) >= 2):
        watermark_height /= 2.8
    elif (height / width) >= 2:
        watermark_height /= 3

    if ((width / height) >= 1.1) and ((width / height) < 1.2):
        watermark_width /= 1.1
    elif ((width / height) >= 1.2) and ((width / height) < 1.3):
        watermark_width /= 1.2
    elif ((width / height) >= 1.3) and ((width / height) < 1.4):
        watermark_width /= 1.3
    elif ((width / height) >= 1.4) and ((width / height) < 1.5):
        watermark_width /= 1.4
    elif ((width / height) >= 1.5) and ((width / height) < 1.6):
        watermark_width /= 1.5
    elif ((width / height) >= 1.6) and ((width / height) < 1.7):
        watermark_width /= 1.6
    elif ((width / height) >= 1.7) and ((width / height) < 1.8):
        watermark_width /= 1.7
    elif ((width / height) >= 1.8) and ((width / height) < 1.9):
        watermark_width /= 1.8
    elif ((width / height) >= 1.9) and ((width / height) < 2):
        watermark_width /= 1.9
    elif (width / height) >= 2:
        watermark_width /= 2


@csrf_exempt
def addWatermark(request):
    watermark_image_khbrfori = "../logo_kh.png"
    watermark_image_khmashhad = "../logo_msh.png"

    if request.method == "POST":
        json_obj = json.loads(request.body)
        data = json_obj["data"]
        if data == "khbrfori-vid":
            vid_name = json_obj["video_name"]
            width = json_obj["video_width"]
            height = json_obj["video_height"]

            # -----------
            output_video = f"../waterMark_vid/{vid_name}.mp4"
            input_video = f"../waterMark_vid/video.mp4"
            # -----------

            difference_w = width - height
            difference_h = height - width

            watermark_vid(input_video, output_video, watermark_image_khbrfori,
                          difference_w, difference_h, width, height)

            return JsonResponse({"message": "success"})
        elif data == "khbrfori-img":

            img_name = json_obj["img_name"]
            width = json_obj["img_width"]
            height = json_obj["img_height"]
            difference_w = width - height
            difference_h = height - width

            watermark_width = width / 6.5
            watermark_height = height / 15

            # check_img_size(height, width, watermark_height, watermark_width)

            if ((height / width) >= 1.1) and ((height / width) >= 1.2):
                watermark_width *= 2.2
            elif ((height / width) >= 1.2) and ((height / width) >= 1.3):
                watermark_width *= 3.6
            elif ((height / width) >= 1.3) and ((height / width) >= 1.4):
                watermark_width *= 5.2
            elif ((height / width) >= 1.4) and ((height / width) >= 1.5):
                watermark_width *= 7
            elif ((height / width) >= 1.5) and ((height / width) >= 1.6):
                watermark_width *= 9
            elif ((height / width) >= 1.6) and ((height / width) >= 1.7):
                watermark_width *= 11.2
            elif ((height / width) >= 1.7) and ((height / width) >= 1.8):
                watermark_width *= 13.6
            elif ((height / width) >= 1.8) and ((height / width) >= 1.9):
                watermark_width *= 16.2
            elif ((height / width) >= 1.9) and ((height / width) >= 2):
                watermark_width *= 19
            elif (height / width) >= 2:
                watermark_width *= 22

            # if ((width / height) >= 1.1) and ((width / height) < 1.2):
            #     watermark_width /= 1.1
            # elif ((width / height) >= 1.2) and ((width / height) < 1.3):
            #     watermark_width /= 1.2
            # elif ((width / height) >= 1.3) and ((width / height) < 1.4):
            #     watermark_width /= 1.3
            # elif ((width / height) >= 1.4) and ((width / height) < 1.5):
            #     watermark_width /= 1.4
            # elif ((width / height) >= 1.5) and ((width / height) < 1.6):
            #     watermark_width /= 1.5
            # elif ((width / height) >= 1.6) and ((width / height) < 1.7):
            #     watermark_width /= 1.6
            # elif ((width / height) >= 1.7) and ((width / height) < 1.8):
            #     watermark_width /= 1.7
            # elif ((width / height) >= 1.8) and ((width / height) < 1.9):
            #     watermark_width /= 1.8
            # elif ((width / height) >= 1.9) and ((width / height) < 2):
            #     watermark_width /= 1.9
            # elif (width / height) >= 2:
            #     watermark_width /= 2

            watermark_padding = height / 10

            # =========
            input_img = f"../Images/image.png"
            output_img = f"../Images/{img_name}.png"
            # =========

            watermark_img(input_img, output_img,
                          watermark_image_khbrfori, watermark_width, watermark_height, watermark_padding)

            return JsonResponse({"message": "success"})

        elif data == "khbrmashhad-vid":
            vid_name = json_obj["video_name"]
            width = json_obj["video_width"]
            height = json_obj["video_height"]
            # -----------
            output_video = f"../waterMark_vid/{vid_name}.mp4"
            input_video = f"../waterMark_vid/video.mp4"
            # -----------

            difference_w = width - height
            difference_h = height - width

            watermark_vid(input_video, output_video, watermark_image_khmashhad,
                          difference_w, difference_h, width, height)

            return JsonResponse({"message": "success"})
        elif data == "khbrmashhad-img":

            img_name = json_obj["img_name"]
            width = json_obj["img_width"]
            height = json_obj["img_height"]
            difference_w = width - height
            difference_h = height - width

            watermark_width = width / 6.5
            watermark_height = height / 15

            # check_img_size(height, width, watermark_height, watermark_width)

            if ((height / width) >= 1.1) and ((height / width) >= 1.2):
                watermark_height /= 1.2
            elif ((height / width) >= 1.2) and ((height / width) >= 1.3):
                watermark_height /= 1.4
            elif ((height / width) >= 1.3) and ((height / width) >= 1.4):
                watermark_height /= 1.6
            elif ((height / width) >= 1.4) and ((height / width) >= 1.5):
                watermark_height /= 1.8
            elif ((height / width) >= 1.5) and ((height / width) >= 1.6):
                watermark_height /= 2
            elif ((height / width) >= 1.6) and ((height / width) >= 1.7):
                watermark_height /= 2.2
            elif ((height / width) >= 1.7) and ((height / width) >= 1.8):
                watermark_height /= 2.4
            elif ((height / width) >= 1.8) and ((height / width) >= 1.9):
                watermark_height /= 2.6
            elif ((height / width) >= 1.9) and ((height / width) >= 2):
                watermark_height /= 2.8
            elif (height / width) >= 2:
                watermark_height /= 3

            if ((width / height) >= 1.1) and ((width / height) < 1.2):
                watermark_width /= 1.1
            elif ((width / height) >= 1.2) and ((width / height) < 1.3):
                watermark_width /= 1.2
            elif ((width / height) >= 1.3) and ((width / height) < 1.4):
                watermark_width /= 1.3
            elif ((width / height) >= 1.4) and ((width / height) < 1.5):
                watermark_width /= 1.4
            elif ((width / height) >= 1.5) and ((width / height) < 1.6):
                watermark_width /= 1.5
            elif ((width / height) >= 1.6) and ((width / height) < 1.7):
                watermark_width /= 1.6
            elif ((width / height) >= 1.7) and ((width / height) < 1.8):
                watermark_width /= 1.7
            elif ((width / height) >= 1.8) and ((width / height) < 1.9):
                watermark_width /= 1.8
            elif ((width / height) >= 1.9) and ((width / height) < 2):
                watermark_width /= 1.9
            elif (width / height) >= 2:
                watermark_width /= 2

        watermark_padding = height / 10

        # =========
        input_img = f"../Images/image.png"
        output_img = f"../Images/{img_name}.png"
        # =========

        watermark_img(input_img, output_img,
                      watermark_image_khmashhad, watermark_width, watermark_height, watermark_padding)

        return JsonResponse({"message": "success"})
